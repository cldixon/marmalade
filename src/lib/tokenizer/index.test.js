import { describe, it, expect, beforeAll } from 'vitest';
import {
	TOKENIZER_CONFIGS,
	tokenizerService,
	tokenize,
	countTokens,
	getTokenizerConfig
} from './index.js';

describe('TOKENIZER_CONFIGS', () => {
	it('should have at least one tokenizer configured', () => {
		expect(TOKENIZER_CONFIGS.length).toBeGreaterThan(0);
	});

	it('should have required fields for each tokenizer', () => {
		for (const config of TOKENIZER_CONFIGS) {
			expect(config).toHaveProperty('id');
			expect(config).toHaveProperty('name');
			expect(config).toHaveProperty('model');
			expect(config).toHaveProperty('contextWindow');
			expect(config).toHaveProperty('description');

			// Validate types
			expect(typeof config.id).toBe('string');
			expect(typeof config.name).toBe('string');
			expect(typeof config.model).toBe('string');
			expect(typeof config.contextWindow).toBe('number');
			expect(config.contextWindow).toBeGreaterThan(0);
		}
	});

	it('should have unique ids', () => {
		const ids = TOKENIZER_CONFIGS.map((c) => c.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('getTokenizerConfig', () => {
	it('should return config for valid tokenizer id', () => {
		const config = getTokenizerConfig('bert-base');
		expect(config).toBeDefined();
		expect(config.model).toBe('bert-base-uncased');
	});

	it('should return undefined for invalid tokenizer id', () => {
		const config = getTokenizerConfig('nonexistent-tokenizer');
		expect(config).toBeUndefined();
	});
});

describe('tokenizerService', () => {
	// Use a smaller/faster model for integration tests
	const testTokenizerId = 'minilm';

	beforeAll(async () => {
		// Pre-load the tokenizer to speed up subsequent tests
		await tokenizerService.load(testTokenizerId);
	}, 60000); // 60s timeout for initial model download

	it('should load a tokenizer and cache it', async () => {
		expect(tokenizerService.isLoaded(testTokenizerId)).toBe(true);
	});

	it('should return cached tokenizer on subsequent loads', async () => {
		const start = performance.now();
		await tokenizerService.load(testTokenizerId);
		const elapsed = performance.now() - start;

		// Cached load should be nearly instant (< 10ms)
		expect(elapsed).toBeLessThan(10);
	});

	it('should throw error for unknown tokenizer', async () => {
		await expect(tokenizerService.load('fake-tokenizer')).rejects.toThrow('Unknown tokenizer');
	});
});

describe('countTokens', () => {
	const testTokenizerId = 'minilm';

	it('should count tokens in simple text', async () => {
		const count = await countTokens('Hello world', testTokenizerId);
		expect(count).toBeGreaterThan(0);
		expect(typeof count).toBe('number');
	});

	it('should return 0 for empty string', async () => {
		const count = await countTokens('', testTokenizerId);
		expect(count).toBe(0);
	});

	it('should count more tokens for longer text', async () => {
		const shortCount = await countTokens('Hello', testTokenizerId);
		const longCount = await countTokens('Hello world, this is a longer sentence.', testTokenizerId);
		expect(longCount).toBeGreaterThan(shortCount);
	});
});

describe('tokenize', () => {
	const testTokenizerId = 'minilm';

	it('should return detailed tokenization result', async () => {
		const result = await tokenize('Hello world', testTokenizerId);

		expect(result).toHaveProperty('text', 'Hello world');
		expect(result).toHaveProperty('tokenizerId', testTokenizerId);
		expect(result).toHaveProperty('tokenCount');
		expect(result).toHaveProperty('tokens');
		expect(result).toHaveProperty('tokenIds');
		expect(result).toHaveProperty('contextWindow');
		expect(result).toHaveProperty('isWithinContext');
		expect(result).toHaveProperty('overflow');

		// Tokens and tokenIds should have same length
		expect(result.tokens.length).toBe(result.tokenIds.length);
		expect(result.tokens.length).toBe(result.tokenCount);
	});

	it('should correctly identify text within context window', async () => {
		const result = await tokenize('Short text', testTokenizerId);
		expect(result.isWithinContext).toBe(true);
		expect(result.overflow).toBe(0);
	});

	it('should detect overflow for very long text', async () => {
		// Create text that exceeds context window (256 for minilm)
		const longText = 'word '.repeat(500);
		const result = await tokenize(longText, testTokenizerId);

		expect(result.tokenCount).toBeGreaterThan(result.contextWindow);
		expect(result.isWithinContext).toBe(false);
		expect(result.overflow).toBeGreaterThan(0);
	});
});
