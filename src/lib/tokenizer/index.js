/**
 * Marmalade Tokenizer Module
 *
 * This module provides a clean interface for tokenizing text using
 * real tokenizers from the Hugging Face transformers.js library.
 *
 * Architecture:
 * - TokenizerService: Manages loading and caching tokenizer instances
 * - tokenize(): Returns detailed tokenization results
 * - countTokens(): Quick token count for a given text
 */

import { AutoTokenizer } from '@huggingface/transformers';

/**
 * Supported tokenizer configurations.
 * Each entry maps to a real Hugging Face model.
 */
export const TOKENIZER_CONFIGS = [
	{
		id: 'bert-base',
		name: 'BERT Base',
		model: 'bert-base-uncased',
		contextWindow: 512,
		description: 'Original BERT - great for general embeddings'
	},
	{
		id: 'mpnet',
		name: 'MPNet (all-mpnet-base-v2)',
		model: 'sentence-transformers/all-mpnet-base-v2',
		contextWindow: 384,
		description: 'Excellent sentence embeddings, balanced performance'
	},
	{
		id: 'minilm',
		name: 'MiniLM (all-MiniLM-L6-v2)',
		model: 'sentence-transformers/all-MiniLM-L6-v2',
		contextWindow: 256,
		description: 'Fast and lightweight, good for most tasks'
	},
	{
		id: 'e5-small',
		name: 'E5 Small',
		model: 'intfloat/e5-small-v2',
		contextWindow: 512,
		description: 'Microsoft E5 - strong multilingual support'
	},
	{
		id: 'gte-small',
		name: 'GTE Small',
		model: 'thenlper/gte-small',
		contextWindow: 512,
		description: 'Alibaba GTE - high quality general embeddings'
	},
	{
		id: 'bge-small',
		name: 'BGE Small',
		model: 'BAAI/bge-small-en-v1.5',
		contextWindow: 512,
		description: 'BAAI BGE - popular for RAG applications'
	},
	{
		id: 'nomic-embed',
		name: 'Nomic Embed',
		model: 'nomic-ai/nomic-embed-text-v1',
		contextWindow: 8192,
		description: 'Nomic - modern model with large context window'
	},
	{
		id: 'instructor-base',
		name: 'Instructor Base',
		model: 'hkunlp/instructor-base',
		contextWindow: 512,
		description: 'Instructor - task-specific embeddings via instructions'
	}
];

/**
 * TokenizerService manages loading, caching, and using tokenizers.
 * Tokenizers are loaded lazily and cached for reuse.
 */
class TokenizerService {
	constructor() {
		/** @type {Map<string, any>} Cache of loaded tokenizer instances */
		this.cache = new Map();

		/** @type {Map<string, Promise<any>>} Track in-flight loading promises */
		this.loading = new Map();
	}

	/**
	 * Get the configuration for a tokenizer by ID.
	 * @param {string} tokenizerId
	 * @returns {object|undefined}
	 */
	getConfig(tokenizerId) {
		return TOKENIZER_CONFIGS.find((t) => t.id === tokenizerId);
	}

	/**
	 * Load a tokenizer instance (or return cached).
	 * @param {string} tokenizerId - The tokenizer ID (e.g., 'bert-base', 'mpnet')
	 * @returns {Promise<any>} The loaded tokenizer instance
	 */
	async load(tokenizerId) {
		// Return cached tokenizer if available
		if (this.cache.has(tokenizerId)) {
			return this.cache.get(tokenizerId);
		}

		// If already loading, wait for that promise
		if (this.loading.has(tokenizerId)) {
			return this.loading.get(tokenizerId);
		}

		const config = this.getConfig(tokenizerId);
		if (!config) {
			throw new Error(`Unknown tokenizer: ${tokenizerId}`);
		}

		// Start loading and track the promise
		const loadPromise = AutoTokenizer.from_pretrained(config.model).then((tokenizer) => {
			this.cache.set(tokenizerId, tokenizer);
			this.loading.delete(tokenizerId);
			return tokenizer;
		});

		this.loading.set(tokenizerId, loadPromise);
		return loadPromise;
	}

	/**
	 * Check if a tokenizer is loaded.
	 * @param {string} tokenizerId
	 * @returns {boolean}
	 */
	isLoaded(tokenizerId) {
		return this.cache.has(tokenizerId);
	}

	/**
	 * Check if a tokenizer is currently loading.
	 * @param {string} tokenizerId
	 * @returns {boolean}
	 */
	isLoading(tokenizerId) {
		return this.loading.has(tokenizerId);
	}

	/**
	 * Tokenize text and return detailed results.
	 * @param {string} text - The text to tokenize
	 * @param {string} tokenizerId - The tokenizer ID
	 * @returns {Promise<TokenizationResult>}
	 */
	async tokenize(text, tokenizerId) {
		const tokenizer = await this.load(tokenizerId);
		const config = this.getConfig(tokenizerId);

		// Encode the text
		const encoded = tokenizer(text, {
			add_special_tokens: false,
			return_offsets_mapping: true
		});

		const inputIds = Array.from(encoded.input_ids.data);
		const tokens = inputIds.map((id) => tokenizer.decode([id]));

		// Get offset mapping if available
		let offsets = null;
		if (encoded.offset_mapping) {
			offsets = Array.from(encoded.offset_mapping.data);
			// Reshape flat array into pairs [start, end]
			offsets = [];
			const flatOffsets = Array.from(encoded.offset_mapping.data);
			for (let i = 0; i < flatOffsets.length; i += 2) {
				offsets.push([flatOffsets[i], flatOffsets[i + 1]]);
			}
		}

		return {
			text,
			tokenizerId,
			model: config.model,
			tokenCount: inputIds.length,
			contextWindow: config.contextWindow,
			tokens,
			tokenIds: inputIds,
			offsets,
			isWithinContext: inputIds.length <= config.contextWindow,
			overflow: Math.max(0, inputIds.length - config.contextWindow)
		};
	}

	/**
	 * Quick token count without full tokenization details.
	 * @param {string} text - The text to count tokens for
	 * @param {string} tokenizerId - The tokenizer ID
	 * @returns {Promise<number>}
	 */
	async countTokens(text, tokenizerId) {
		const tokenizer = await this.load(tokenizerId);
		const encoded = tokenizer(text, { add_special_tokens: false });
		return encoded.input_ids.data.length;
	}

	/**
	 * Clear the tokenizer cache (useful for memory management).
	 */
	clearCache() {
		this.cache.clear();
	}
}

// Export a singleton instance
export const tokenizerService = new TokenizerService();

// Convenience exports
export const tokenize = (text, tokenizerId) => tokenizerService.tokenize(text, tokenizerId);
export const countTokens = (text, tokenizerId) => tokenizerService.countTokens(text, tokenizerId);
export const loadTokenizer = (tokenizerId) => tokenizerService.load(tokenizerId);
export const isTokenizerLoaded = (tokenizerId) => tokenizerService.isLoaded(tokenizerId);
export const isTokenizerLoading = (tokenizerId) => tokenizerService.isLoading(tokenizerId);
export const getTokenizerConfig = (tokenizerId) => tokenizerService.getConfig(tokenizerId);

/**
 * @typedef {Object} TokenizationResult
 * @property {string} text - Original input text
 * @property {string} tokenizerId - The tokenizer ID used
 * @property {string} model - The Hugging Face model name
 * @property {number} tokenCount - Total number of tokens
 * @property {number} contextWindow - Max context window for this tokenizer
 * @property {string[]} tokens - Array of decoded token strings
 * @property {number[]} tokenIds - Array of token IDs
 * @property {Array<[number, number]>|null} offsets - Character offsets for each token
 * @property {boolean} isWithinContext - Whether text fits in context window
 * @property {number} overflow - Number of tokens exceeding context window
 */
