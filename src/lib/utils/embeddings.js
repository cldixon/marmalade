export const EMBEDDING_MODELS = [
	{
		id: 'text-embedding-3-small',
		name: 'text-embedding-3-small',
		defaultDimensions: 1536,
		supportsDimensionReduction: true,
		maxInputTokens: 8192
	},
	{
		id: 'text-embedding-3-large',
		name: 'text-embedding-3-large',
		defaultDimensions: 3072,
		supportsDimensionReduction: true,
		maxInputTokens: 8192
	},
	{
		id: 'text-embedding-ada-002',
		name: 'text-embedding-ada-002',
		defaultDimensions: 1536,
		supportsDimensionReduction: false,
		maxInputTokens: 8191
	}
];
