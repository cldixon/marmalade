export const strategies = [
	{ id: 'tokens', name: 'Fixed Tokens', description: 'Splits text into chunks of a fixed token count. Simple and predictable, but may cut mid-sentence.' },
	{ id: 'hybrid', name: 'Hybrid', description: 'Groups whole sentences together up to the token limit. Preserves sentence boundaries for more coherent chunks.' }
];
