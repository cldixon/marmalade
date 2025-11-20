// Cache for loaded tokenizers to avoid reloading
const tokenizerCache = new Map();

/**
 * Get or load a tokenizer for the specified model using CDN import
 * @param {string} modelId - The Hugging Face model ID
 * @returns {Promise<any>} The tokenizer instance
 */
export async function getTokenizer(modelId) {
	// Only works in browser
	if (typeof window === 'undefined') {
		throw new Error('Tokenizer can only be loaded in browser environment');
	}

	if (tokenizerCache.has(modelId)) {
		return tokenizerCache.get(modelId);
	}

	try {
		// Use CDN import to bypass Vite bundling issues
		const { AutoTokenizer, env } = await import(
			'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
		);

		// Configure on first use
		env.allowLocalModels = false;

		console.log('Loading tokenizer for:', modelId);
		const tokenizer = await AutoTokenizer.from_pretrained(modelId);
		tokenizerCache.set(modelId, tokenizer);
		console.log('Tokenizer loaded successfully');
		return tokenizer;
	} catch (error) {
		console.error(`Failed to load tokenizer for ${modelId}:`, error);
		throw error;
	}
}

/**
 * Tokenize text using the specified tokenizer
 * @param {string} text - The text to tokenize
 * @param {any} tokenizer - The tokenizer instance
 * @returns {Object} Tokenization result with IDs, tokens, and metadata
 */
export function tokenizeText(text, tokenizer) {
	if (!text || !tokenizer) {
		return {
			text: text || '',
			tokenIds: [],
			tokens: [],
			totalTokens: 0
		};
	}

	try {
		// Encode the text to get token IDs
		const encoded = tokenizer.encode(text);
		const tokenIds = Array.from(encoded);

		// Decode each token individually to get token strings
		const tokens = tokenIds.map((id) => {
			try {
				return tokenizer.decode([id], { skip_special_tokens: false });
			} catch {
				return '[UNK]';
			}
		});

		return {
			text,
			tokenIds,
			tokens,
			totalTokens: tokenIds.length
		};
	} catch (error) {
		console.error('Error tokenizing text:', error);
		return {
			text,
			tokenIds: [],
			tokens: [],
			totalTokens: 0
		};
	}
}

/**
 * Create chunks from tokenized text based on max tokens and overlap
 * @param {Object} tokenizedResult - Result from tokenizeText()
 * @param {number} maxTokens - Maximum tokens per chunk
 * @param {number} overlapTokens - Number of tokens to overlap between chunks
 * @returns {Array} Array of chunk objects
 */
export function createTokenChunks(tokenizedResult, maxTokens, overlapTokens = 0) {
	const { text, tokenIds, tokens, totalTokens } = tokenizedResult;

	if (totalTokens === 0) {
		return [];
	}

	const chunks = [];
	let startIdx = 0;

	while (startIdx < totalTokens) {
		const endIdx = Math.min(startIdx + maxTokens, totalTokens);

		// Get the token slice for this chunk
		const chunkTokenIds = tokenIds.slice(startIdx, endIdx);
		const chunkTokens = tokens.slice(startIdx, endIdx);

		// Reconstruct the text for this chunk by decoding the token IDs
		// This is more accurate than trying to slice the original text
		const chunkText = chunkTokens.join('').trim();

		chunks.push({
			startTokenIndex: startIdx,
			endTokenIndex: endIdx,
			tokenCount: chunkTokenIds.length,
			tokenIds: chunkTokenIds,
			tokens: chunkTokens,
			text: chunkText,
			overlapTokens: startIdx > 0 ? overlapTokens : 0
		});

		// Move to next chunk, accounting for overlap
		startIdx += maxTokens - overlapTokens;

		// Prevent infinite loop if overlap >= maxTokens
		if (maxTokens <= overlapTokens) {
			break;
		}
	}

	return chunks;
}

/**
 * Helper to map tokens back to approximate character positions in original text
 * This is best-effort and may not be perfect due to tokenizer quirks
 * @param {string} text - Original text
 * @param {Array<string>} tokens - Array of token strings
 * @returns {Array<Object>} Array of {token, startChar, endChar}
 */
export function mapTokensToCharPositions(text, tokens) {
	const mapped = [];
	let currentPos = 0;

	for (const token of tokens) {
		// Clean the token (remove special prefixes like ## or Ġ)
		const cleanToken = token.replace(/^(##|Ġ|▁)/, '').replace(/Ġ/g, ' ');

		if (!cleanToken) {
			// Empty token (e.g., special tokens)
			mapped.push({
				token,
				startChar: currentPos,
				endChar: currentPos
			});
			continue;
		}

		// Try to find the token in the remaining text
		const searchText = text.slice(currentPos);
		let foundPos = searchText.indexOf(cleanToken);

		// If exact match fails, try case-insensitive
		if (foundPos === -1) {
			foundPos = searchText.toLowerCase().indexOf(cleanToken.toLowerCase());
		}

		if (foundPos !== -1) {
			const startChar = currentPos + foundPos;
			const endChar = startChar + cleanToken.length;
			mapped.push({
				token,
				startChar,
				endChar
			});
			currentPos = endChar;
		} else {
			// Couldn't find the token, just increment position
			mapped.push({
				token,
				startChar: currentPos,
				endChar: currentPos + cleanToken.length
			});
			currentPos += cleanToken.length;
		}
	}

	return mapped;
}
