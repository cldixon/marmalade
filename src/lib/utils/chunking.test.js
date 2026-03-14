import { describe, it, expect, beforeAll } from 'vitest';
import { tokenizerService } from '$lib/tokenizer/index.js';
import { calculateChunksReal } from './chunking.js';

const TOKENIZER = 'minilm';

beforeAll(async () => {
	await tokenizerService.load(TOKENIZER);
}, 60000);

// Long enough text to produce multiple chunks at small maxTokens
const LONG_TEXT =
	'The quick brown fox jumps over the lazy dog. ' +
	'She sells seashells by the seashore. ' +
	'Peter Piper picked a peck of pickled peppers. ' +
	'How much wood would a woodchuck chuck if a woodchuck could chuck wood. ' +
	'Jack and Jill went up the hill to fetch a pail of water. ' +
	'Humpty Dumpty sat on a wall, Humpty Dumpty had a great fall. ' +
	'All the kings horses and all the kings men could not put Humpty together again. ' +
	'Mary had a little lamb whose fleece was white as snow. ' +
	'And everywhere that Mary went the lamb was sure to go.';

describe('calculateChunksReal', () => {
	describe('fixed tokens strategy', () => {
		it('produces correct chunk count and token counts', async () => {
			const result = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER);
			expect(result.chunks.length).toBeGreaterThan(1);
			expect(result.totalTokens).toBe(result.chunks.reduce((s, c) => s + c.tokenCount, 0));
		});

		it('each chunk respects maxTokens', async () => {
			const maxTokens = 25;
			const result = await calculateChunksReal(LONG_TEXT, 'tokens', maxTokens, 0, 'token', TOKENIZER);
			for (const chunk of result.chunks) {
				expect(chunk.tokenCount).toBeLessThanOrEqual(maxTokens);
			}
		});

		it('overlap creates shared content between adjacent chunks', async () => {
			const result = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 10, 'token', TOKENIZER);
			expect(result.chunks.length).toBeGreaterThan(1);

			// With overlap, adjacent chunks should share some text
			for (let i = 1; i < result.chunks.length; i++) {
				const prev = result.chunks[i - 1];
				const curr = result.chunks[i];
				// Current chunk should start before previous chunk ends (character overlap)
				expect(curr.tokenStartIdx).toBeLessThan(prev.tokenEndIdx);
			}
		});
	});

	describe('hybrid strategy', () => {
		it('groups sentences within maxTokens', async () => {
			const result = await calculateChunksReal(LONG_TEXT, 'hybrid', 50, 0, 'token', TOKENIZER);
			expect(result.chunks.length).toBeGreaterThan(1);
		});

		it('no chunk exceeds maxTokens', async () => {
			const maxTokens = 40;
			const result = await calculateChunksReal(LONG_TEXT, 'hybrid', maxTokens, 0, 'token', TOKENIZER);
			for (const chunk of result.chunks) {
				expect(chunk.tokenCount).toBeLessThanOrEqual(maxTokens);
			}
		});
	});

	describe('minChunkSize (padSmallTrailingChunk)', () => {
		describe('fixed tokens', () => {
			it('no padding when minChunkSize=0', async () => {
				const result = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 0);
				// Should produce chunks normally; last chunk may be small
				expect(result.chunks.length).toBeGreaterThan(1);
			});

			it('no padding when trailing chunk >= minChunkSize', async () => {
				const result = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 1);
				const lastChunk = result.chunks[result.chunks.length - 1];
				// minChunkSize=1, any non-empty chunk satisfies it
				expect(lastChunk.tokenCount).toBeGreaterThanOrEqual(1);
			});

			it('pads trailing chunk backward to reach minChunkSize', async () => {
				// First get chunks without minChunkSize to see original trailing chunk
				const base = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 0);
				const baseLastChunk = base.chunks[base.chunks.length - 1];

				// Only test padding if trailing chunk is actually small
				if (baseLastChunk.tokenCount < 20) {
					const padded = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 20);
					const paddedLastChunk = padded.chunks[padded.chunks.length - 1];
					expect(paddedLastChunk.tokenCount).toBeGreaterThanOrEqual(
						Math.min(20, 30) // min of minChunkSize and maxTokens
					);
					// Padded chunk should have more tokens than original
					expect(paddedLastChunk.tokenCount).toBeGreaterThan(baseLastChunk.tokenCount);
				}
			});

			it('padded chunk does not exceed maxTokens', async () => {
				const maxTokens = 30;
				const padded = await calculateChunksReal(LONG_TEXT, 'tokens', maxTokens, 0, 'token', TOKENIZER, 25);
				for (const chunk of padded.chunks) {
					expect(chunk.tokenCount).toBeLessThanOrEqual(maxTokens);
				}
			});

			it('previous chunk is unchanged after padding', async () => {
				const base = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 0);
				const padded = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 20);

				// All chunks except possibly the last should be identical
				for (let i = 0; i < base.chunks.length - 1; i++) {
					expect(padded.chunks[i].text).toBe(base.chunks[i].text);
					expect(padded.chunks[i].tokenCount).toBe(base.chunks[i].tokenCount);
					expect(padded.chunks[i].tokenStartIdx).toBe(base.chunks[i].tokenStartIdx);
					expect(padded.chunks[i].tokenEndIdx).toBe(base.chunks[i].tokenEndIdx);
				}
			});

			it('padded chunk text starts earlier in original text (overlap)', async () => {
				const base = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 0);
				const baseLastChunk = base.chunks[base.chunks.length - 1];

				if (baseLastChunk.tokenCount < 20) {
					const padded = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 20);
					const paddedLastChunk = padded.chunks[padded.chunks.length - 1];
					// Padded chunk should start earlier in the text
					expect(paddedLastChunk.charStart).toBeLessThan(baseLastChunk.charStart);
					expect(paddedLastChunk.tokenStartIdx).toBeLessThan(baseLastChunk.tokenStartIdx);
				}
			});

			it('works with overlap > 0 (both settings compose)', async () => {
				const result = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 5, 'token', TOKENIZER, 20);
				const lastChunk = result.chunks[result.chunks.length - 1];
				// Trailing chunk should meet minChunkSize (or maxTokens cap)
				expect(lastChunk.tokenCount).toBeGreaterThanOrEqual(
					Math.min(20, 30)
				);
				// No chunk exceeds maxTokens
				for (const chunk of result.chunks) {
					expect(chunk.tokenCount).toBeLessThanOrEqual(30);
				}
			});

			it('single chunk: no padding applied', async () => {
				const shortText = 'Hello world.';
				const result = await calculateChunksReal(shortText, 'tokens', 100, 0, 'token', TOKENIZER, 50);
				expect(result.chunks.length).toBe(1);
			});

			it('text fits exactly in maxTokens: no trailing chunk', async () => {
				// Use a text and maxTokens large enough to fit everything in one chunk
				const shortText = 'Hello world.';
				const result = await calculateChunksReal(shortText, 'tokens', 256, 0, 'token', TOKENIZER, 10);
				expect(result.chunks.length).toBe(1);
			});

			it('trailing chunk is 1 token', async () => {
				// This is a stress test — the trailing chunk should still get padded
				const base = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 0);
				const baseLastTokenCount = base.chunks[base.chunks.length - 1].tokenCount;

				if (baseLastTokenCount < 15) {
					const padded = await calculateChunksReal(LONG_TEXT, 'tokens', 30, 0, 'token', TOKENIZER, 15);
					const paddedLast = padded.chunks[padded.chunks.length - 1];
					expect(paddedLast.tokenCount).toBeGreaterThanOrEqual(
						Math.min(15, 30)
					);
				}
			});
		});

		describe('hybrid', () => {
			it('pads trailing chunk below minChunkSize', async () => {
				const base = await calculateChunksReal(LONG_TEXT, 'hybrid', 50, 0, 'token', TOKENIZER, 0);
				const baseLast = base.chunks[base.chunks.length - 1];

				if (baseLast.tokenCount < 30) {
					const padded = await calculateChunksReal(LONG_TEXT, 'hybrid', 50, 0, 'token', TOKENIZER, 30);
					const paddedLast = padded.chunks[padded.chunks.length - 1];
					expect(paddedLast.tokenCount).toBeGreaterThanOrEqual(
						Math.min(30, 50)
					);
				}
			});

			it('padded chunk does not exceed maxTokens', async () => {
				const maxTokens = 50;
				const padded = await calculateChunksReal(LONG_TEXT, 'hybrid', maxTokens, 0, 'token', TOKENIZER, 40);
				for (const chunk of padded.chunks) {
					expect(chunk.tokenCount).toBeLessThanOrEqual(maxTokens);
				}
			});
		});
	});

	describe('edge cases', () => {
		it('empty text returns empty chunks', async () => {
			const result = await calculateChunksReal('', 'tokens', 30, 0, 'token', TOKENIZER);
			expect(result.chunks).toEqual([]);
			expect(result.totalTokens).toBe(0);
		});

		it('whitespace-only text', async () => {
			const result = await calculateChunksReal('   \n\t  ', 'tokens', 30, 0, 'token', TOKENIZER);
			// Whitespace may or may not produce tokens depending on tokenizer
			// but should not throw
			expect(Array.isArray(result.chunks)).toBe(true);
		});

		it('minChunkSize > maxTokens caps gracefully', async () => {
			const maxTokens = 30;
			// minChunkSize exceeds maxTokens — should not produce chunks > maxTokens
			const result = await calculateChunksReal(LONG_TEXT, 'tokens', maxTokens, 0, 'token', TOKENIZER, 100);
			for (const chunk of result.chunks) {
				expect(chunk.tokenCount).toBeLessThanOrEqual(maxTokens);
			}
		});
	});
});
