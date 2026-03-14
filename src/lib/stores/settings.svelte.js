/**
 * Shared reactive settings store using Svelte 5 runes.
 * Grouped by concern — components import and mutate directly.
 */
export const settings = $state({
	tokenizer: {
		modelId: 'mpnet',
		strategy: 'tokens',
		maxTokens: 384,
		overlap: 0,
		minChunkSize: 0,
		overlapStrategy: 'token'
	},
	embedding: {
		model: 'text-embedding-3-small',
		dimensions: null
	}
});
