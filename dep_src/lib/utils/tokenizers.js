export const tokenizers = [
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
	}
];
