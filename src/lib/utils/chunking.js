import { tokenize, getCharBoundary } from '$lib/tokenizer/index.js';

/**
 * Calculate chunks from text using real tokenization — no estimates.
 * Tokenizes the full text once, then uses decode-based character boundary
 * lookups to slice the original text at exact token boundaries.
 *
 * @param {string} text - The text to chunk
 * @param {string} strategy - Chunking strategy ('tokens', 'hybrid')
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens (for 'tokens' strategy)
 * @param {string} [overlapStrategy='token'] - Overlap strategy ('token' or 'sentence')
 * @param {string} tokenizerId - The tokenizer ID to use
 * @returns {Promise<ChunkResult>}
 */
export async function calculateChunksReal(text, strategy, maxTokens, overlap, overlapStrategy = 'token', tokenizerId) {
	if (!text) return { chunks: [], totalTokens: 0, tokenization: null };

	const tokenization = await tokenize(text, tokenizerId);
	const { tokenIds, tokenCount } = tokenization;

	if (tokenCount === 0) {
		return { chunks: [], totalTokens: 0, tokenization };
	}

	let chunks = [];

	if (strategy === 'tokens') {
		if (overlapStrategy === 'sentence' && overlap > 0) {
			chunks = await chunkTokensSentenceOverlap(text, tokenIds, tokenCount, maxTokens, tokenizerId);
		} else {
			chunks = await chunkTokensFixed(text, tokenIds, tokenCount, maxTokens, overlap, tokenizerId);
		}
	} else if (strategy === 'hybrid') {
		chunks = await chunkHybrid(text, tokenIds, tokenCount, maxTokens, tokenizerId);
	}

	const totalTokens = chunks.reduce((s, c) => s + c.tokenCount, 0);
	return { chunks, totalTokens, tokenization };
}

/**
 * Fixed token chunking with optional token overlap.
 * Walks through tokens in groups of maxTokens, slicing original text
 * at exact character boundaries determined by decode.
 */
async function chunkTokensFixed(text, tokenIds, tokenCount, maxTokens, overlap, tokenizerId) {
	const chunks = [];
	const step = Math.max(1, maxTokens - overlap);

	// Pre-compute all needed character boundaries
	const boundaries = new Set([0]);
	for (let start = 0; start < tokenCount; start += step) {
		boundaries.add(start);
		const end = Math.min(start + maxTokens, tokenCount);
		boundaries.add(end);
		if (end >= tokenCount) break;
	}

	// Batch resolve boundaries
	const boundaryMap = await resolveBoundaries(tokenIds, boundaries, tokenizerId, text.length);

	for (let start = 0; start < tokenCount; start += step) {
		const end = Math.min(start + maxTokens, tokenCount);
		const charStart = boundaryMap.get(start);
		const charEnd = boundaryMap.get(end);
		const chunkText = text.slice(charStart, charEnd).trim();

		if (chunkText) {
			chunks.push({
				text: chunkText,
				tokenCount: end - start,
				tokenStartIdx: start,
				tokenEndIdx: end,
				charStart,
				charEnd
			});
		}
		if (end >= tokenCount) break;
	}

	return chunks;
}

/**
 * Tokens strategy with sentence-boundary overlap.
 */
async function chunkTokensSentenceOverlap(text, tokenIds, tokenCount, maxTokens, tokenizerId) {
	const chunks = [];
	let start = 0;

	while (start < tokenCount) {
		const end = Math.min(start + maxTokens, tokenCount);

		// Get character boundaries for this chunk
		const [charStart, charEnd] = await Promise.all([
			getCharBoundary(tokenIds, start, tokenizerId).then(pos => skipLeadingWhitespace(text, pos)),
			getCharBoundary(tokenIds, end, tokenizerId)
		]);

		const chunkText = text.slice(charStart, charEnd).trim();

		if (chunkText) {
			chunks.push({
				text: chunkText,
				tokenCount: end - start,
				tokenStartIdx: start,
				tokenEndIdx: end,
				charStart,
				charEnd
			});
		}

		if (end >= tokenCount) break;

		// Look backward from chunk end for a sentence boundary
		const sentenceEndMatch = chunkText.match(/.*[.!?]\s*/);
		if (sentenceEndMatch) {
			// Find char position of sentence boundary in original text
			const boundaryCharPos = charStart + sentenceEndMatch[0].length;
			// Find the token index at this character position via binary search
			let nextStart = await findTokenAtChar(tokenIds, boundaryCharPos, start, end, tokenizerId);
			start = nextStart > start ? nextStart : end;
		} else {
			start = end;
		}
	}

	return chunks;
}

/**
 * Binary search for the token index whose character boundary is at or after targetCharPos.
 */
async function findTokenAtChar(tokenIds, targetCharPos, lo, hi, tokenizerId) {
	while (lo < hi) {
		const mid = Math.floor((lo + hi) / 2);
		const charPos = await getCharBoundary(tokenIds, mid, tokenizerId);
		if (charPos < targetCharPos) {
			lo = mid + 1;
		} else {
			hi = mid;
		}
	}
	return lo;
}

/**
 * Hybrid strategy: split text into sentences, then accumulate
 * sentences into chunks using real token counts.
 * Tokenizes each sentence to get exact counts.
 */
async function chunkHybrid(text, tokenIds, tokenCount, maxTokens, tokenizerId) {
	const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
	const chunks = [];

	// Tokenize each sentence to get real token counts
	const sentenceTokenCounts = await Promise.all(
		sentences.map(async (s) => {
			const result = await tokenize(s.trim(), tokenizerId);
			return result.tokenCount;
		})
	);

	let pendingSentences = [];
	let pendingTokenCount = 0;

	for (let i = 0; i < sentences.length; i++) {
		const sentence = sentences[i];
		const sentTokens = sentenceTokenCounts[i];

		if (pendingTokenCount + sentTokens > maxTokens && pendingSentences.length > 0) {
			// Flush current chunk
			const chunkText = pendingSentences.join(' ').trim();
			if (chunkText) {
				chunks.push({
					text: chunkText,
					tokenCount: pendingTokenCount,
					tokenStartIdx: 0, // Not precisely tracked in hybrid
					tokenEndIdx: 0,
					charStart: 0,
					charEnd: 0
				});
			}
			pendingSentences = [sentence];
			pendingTokenCount = sentTokens;
		} else {
			pendingSentences.push(sentence);
			pendingTokenCount += sentTokens;
		}
	}

	// Flush remaining
	if (pendingSentences.length > 0) {
		const chunkText = pendingSentences.join(' ').trim();
		if (chunkText) {
			chunks.push({
				text: chunkText,
				tokenCount: pendingTokenCount,
				tokenStartIdx: 0,
				tokenEndIdx: 0,
				charStart: 0,
				charEnd: 0
			});
		}
	}

	return chunks;
}

/**
 * Resolve multiple token-index → char-position boundaries in parallel.
 */
async function resolveBoundaries(tokenIds, boundarySet, tokenizerId, textLength) {
	const map = new Map();
	const entries = [...boundarySet].sort((a, b) => a - b);

	await Promise.all(
		entries.map(async (tokenIdx) => {
			if (tokenIdx >= tokenIds.length) {
				map.set(tokenIdx, textLength);
			} else {
				const charPos = await getCharBoundary(tokenIds, tokenIdx, tokenizerId);
				map.set(tokenIdx, charPos);
			}
		})
	);

	return map;
}

/**
 * Skip leading whitespace from a position in text.
 */
function skipLeadingWhitespace(text, pos) {
	while (pos < text.length && /\s/.test(text[pos])) {
		pos++;
	}
	return pos;
}

/**
 * Merge a small trailing chunk into the previous chunk.
 * Uses real token counts from the chunk objects.
 *
 * @param {ChunkInfo[]} chunks - Array of chunk objects
 * @param {number} minChunkSize - Minimum token count threshold
 * @returns {ChunkInfo[]} Chunks with small trailing chunk merged
 */
export function mergeSmallTrailingChunk(chunks, minChunkSize) {
	if (minChunkSize <= 0 || chunks.length < 2) return chunks;

	const lastChunk = chunks[chunks.length - 1];
	if (lastChunk.tokenCount < minChunkSize) {
		const merged = [...chunks];
		const removed = merged.pop();
		const prev = merged[merged.length - 1];
		merged[merged.length - 1] = {
			text: prev.text + ' ' + removed.text,
			tokenCount: prev.tokenCount + removed.tokenCount,
			tokenStartIdx: prev.tokenStartIdx,
			tokenEndIdx: removed.tokenEndIdx,
			charStart: prev.charStart,
			charEnd: removed.charEnd
		};
		return merged;
	}
	return chunks;
}

/**
 * Build metadata for a chunk from pre-computed data.
 * No async call needed — all data comes from the chunk object.
 *
 * @param {ChunkInfo} chunk - The chunk object with pre-computed data
 * @param {string} strategy - Chunking strategy
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens
 * @returns {ChunkMetadata}
 */
export function buildChunkMetadata(chunk, strategy, maxTokens, overlap) {
	const words = chunk.text.split(/\s+/).filter((w) => w.length > 0).length;
	const chars = chunk.text.length;
	const sentenceMatches = chunk.text.match(/[.!?]+/g);
	const sentences = sentenceMatches ? sentenceMatches.length : 0;
	const tokens = chunk.tokenCount;
	const util = tokens / maxTokens;

	let qual = 'Good';
	if (util > 0.7 && util < 0.95) {
		qual = 'Excellent';
	} else if (util < 0.5) {
		qual = 'Low';
	}

	const endsClean = /[.!?]\s*$/.test(chunk.text.trim());
	if (!endsClean && strategy !== 'tokens') {
		qual = 'Warning';
	}

	const overlapTok = strategy === 'tokens' ? overlap : 0;

	return {
		words,
		chars,
		sentences,
		tokens,
		utilization: Math.round(util * 100),
		quality: qual,
		overlapTokens: overlapTok
	};
}

/**
 * Get alternating colors for chunk visualization.
 * @param {number} index - Chunk index
 * @param {object} theme - Theme object with color values
 * @returns {{bg: string, border: string}}
 */
export function getChunkColor(index, theme) {
	if (index % 2 === 0) {
		return { bg: theme.light, border: theme.primary };
	}
	return { bg: theme.background, border: theme.accent };
}

/**
 * @typedef {Object} ChunkInfo
 * @property {string} text - The chunk text
 * @property {number} tokenCount - Real token count
 * @property {number} tokenStartIdx - Start token index in full tokenization
 * @property {number} tokenEndIdx - End token index (exclusive)
 * @property {number} charStart - Start character index in original text
 * @property {number} charEnd - End character index in original text
 */

/**
 * @typedef {Object} ChunkResult
 * @property {ChunkInfo[]} chunks - Array of chunk objects
 * @property {number} totalTokens - Sum of all chunk token counts
 * @property {import('$lib/tokenizer/index.js').TokenizationResult|null} tokenization - The full tokenization result
 */

/**
 * @typedef {Object} ChunkMetadata
 * @property {number} words - Word count
 * @property {number} chars - Character count
 * @property {number} sentences - Sentence count
 * @property {number} tokens - Real token count
 * @property {number} utilization - Percentage of max tokens used
 * @property {string} quality - Quality assessment ('Excellent', 'Good', 'Warning', 'Low')
 * @property {number} overlapTokens - Number of overlap tokens
 */
