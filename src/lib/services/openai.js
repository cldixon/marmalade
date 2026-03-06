/**
 * OpenAI Embeddings API client.
 * Runs entirely client-side — API key is passed per-call, never stored here.
 *
 * @param {string} text - The text to embed
 * @param {{ apiKey: string, model: string, dimensions?: number | null }} options
 * @returns {Promise<{ data: Array<{ embedding: number[], index: number }>, model: string, usage: { prompt_tokens: number, total_tokens: number } }>}
 */
export async function getEmbedding(text, { apiKey, model, dimensions }) {
	const body = { input: text, model };
	if (dimensions) {
		body.dimensions = dimensions;
	}

	const response = await fetch('https://api.openai.com/v1/embeddings', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const err = await response.json().catch(() => ({}));
		throw new Error(err.error?.message || `API error: ${response.status}`);
	}

	return response.json();
}
