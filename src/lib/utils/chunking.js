import { countTokens } from '$lib/tokenizer/index.js';

/**
 * Calculate chunks from text based on strategy.
 * Note: For 'tokens' and 'hybrid' strategies, this uses estimated tokens
 * for the initial chunking. Use getChunkMetadata() with a tokenizer for
 * accurate token counts per chunk.
 *
 * @param {string} text - The text to chunk
 * @param {string} strategy - Chunking strategy ('paragraph', 'sentence', 'tokens', 'hybrid')
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens (for 'tokens' strategy)
 * @returns {string[]} Array of text chunks
 */
export function calculateChunks(text, strategy, maxTokens, overlap) {
	if (!text) return [];

	let newChunks = [];

	if (strategy === 'paragraph') {
		newChunks = text.split(/\n\n+/).filter((p) => p.trim());
	} else if (strategy === 'sentence') {
		newChunks = text.match(/[^.!?]+[.!?]+/g) || [text];
	} else if (strategy === 'tokens') {
		const words = text.split(/\s+/);
		// Use 1.3 as rough estimate for initial chunking
		// Real token counts come from getChunkMetadata
		const wordsPerChunk = Math.floor(maxTokens / 1.3);
		for (let i = 0; i < words.length; i += wordsPerChunk - overlap) {
			const chunk = words.slice(i, i + wordsPerChunk).join(' ');
			if (chunk.trim()) newChunks.push(chunk);
		}
	} else if (strategy === 'hybrid') {
		const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
		let current = [];
		let currentLength = 0;
		const avgTokensPerWord = 1.3;

		for (let i = 0; i < sentences.length; i++) {
			const sentence = sentences[i];
			const sentenceWords = sentence.split(/\s+/).length;
			const estimatedTokens = sentenceWords * avgTokensPerWord;

			if (currentLength + estimatedTokens > maxTokens && current.length > 0) {
				newChunks.push(current.join(' '));
				current = [sentence];
				currentLength = estimatedTokens;
			} else {
				current.push(sentence);
				currentLength += estimatedTokens;
			}
		}

		if (current.length > 0) {
			newChunks.push(current.join(' '));
		}
	}

	return newChunks;
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
 * Get metadata for a chunk using estimated token counts.
 * This is the synchronous version for backwards compatibility.
 *
 * @param {string} chunk - The chunk text
 * @param {string} strategy - Chunking strategy
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens
 * @returns {ChunkMetadata}
 */
export function getChunkMetadata(chunk, strategy, maxTokens, overlap) {
	const words = chunk.split(/\s+/).filter((w) => w.length > 0).length;
	const chars = chunk.length;
	const sentenceMatches = chunk.match(/[.!?]+/g);
	const sentences = sentenceMatches ? sentenceMatches.length : 0;
	const estimatedTokens = Math.ceil(words * 1.3);
	const util = estimatedTokens / maxTokens;

	let qual = 'Good';
	if (util > 0.7 && util < 0.95) {
		qual = 'Excellent';
	} else if (util < 0.5) {
		qual = 'Low';
	}

	const endsClean = /[.!?]\s*$/.test(chunk.trim());
	if (!endsClean && strategy !== 'tokens') {
		qual = 'Warning';
	}

	const overlapTok = strategy === 'tokens' ? overlap : 0;

	return {
		words,
		chars,
		sentences,
		tokens: estimatedTokens,
		estimatedTokens, // Keep for backwards compatibility
		utilization: Math.round(util * 100),
		quality: qual,
		overlapTokens: overlapTok,
		isEstimated: true
	};
}

/**
 * Get metadata for a chunk using real tokenization.
 * This is async and requires the tokenizer to be loaded.
 *
 * @param {string} chunk - The chunk text
 * @param {string} strategy - Chunking strategy
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens
 * @param {string} tokenizerId - The tokenizer ID to use
 * @returns {Promise<ChunkMetadata>}
 */
export async function getChunkMetadataAsync(chunk, strategy, maxTokens, overlap, tokenizerId) {
	const words = chunk.split(/\s+/).filter((w) => w.length > 0).length;
	const chars = chunk.length;
	const sentenceMatches = chunk.match(/[.!?]+/g);
	const sentences = sentenceMatches ? sentenceMatches.length : 0;

	// Get real token count
	const tokens = await countTokens(chunk, tokenizerId);
	const util = tokens / maxTokens;

	let qual = 'Good';
	if (util > 0.7 && util < 0.95) {
		qual = 'Excellent';
	} else if (util < 0.5) {
		qual = 'Low';
	}

	const endsClean = /[.!?]\s*$/.test(chunk.trim());
	if (!endsClean && strategy !== 'tokens') {
		qual = 'Warning';
	}

	const overlapTok = strategy === 'tokens' ? overlap : 0;

	return {
		words,
		chars,
		sentences,
		tokens,
		estimatedTokens: tokens, // For backwards compatibility
		utilization: Math.round(util * 100),
		quality: qual,
		overlapTokens: overlapTok,
		isEstimated: false
	};
}

/**
 * Compute metadata for all chunks asynchronously.
 * Returns a map of chunk index to metadata.
 *
 * @param {string[]} chunks - Array of chunk texts
 * @param {string} strategy - Chunking strategy
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlap - Overlap tokens
 * @param {string} tokenizerId - The tokenizer ID to use
 * @returns {Promise<Map<number, ChunkMetadata>>}
 */
export async function computeAllChunkMetadata(chunks, strategy, maxTokens, overlap, tokenizerId) {
	const results = new Map();

	// Process all chunks in parallel
	const metadataPromises = chunks.map((chunk, index) =>
		getChunkMetadataAsync(chunk, strategy, maxTokens, overlap, tokenizerId).then((metadata) => ({
			index,
			metadata
		}))
	);

	const resolved = await Promise.all(metadataPromises);
	for (const { index, metadata } of resolved) {
		results.set(index, metadata);
	}

	return results;
}

/**
 * @typedef {Object} ChunkMetadata
 * @property {number} words - Word count
 * @property {number} chars - Character count
 * @property {number} sentences - Sentence count
 * @property {number} tokens - Token count (real or estimated)
 * @property {number} estimatedTokens - For backwards compatibility
 * @property {number} utilization - Percentage of max tokens used
 * @property {string} quality - Quality assessment ('Excellent', 'Good', 'Warning', 'Low')
 * @property {number} overlapTokens - Number of overlap tokens
 * @property {boolean} isEstimated - Whether token count is estimated
 */
