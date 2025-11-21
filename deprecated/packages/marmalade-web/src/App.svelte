<script>
	let text = 'Hello world! This is a test of the Marmalade chunking system.';
	let chunks = [];
	let loading = false;
	let error = null;

	const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

	async function chunkText() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`${API_URL}/chunk`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: text,
					tokenizer_name: 'bert-base-uncased',
					chunk_size: 10
				})
			});

			if (!response.ok) {
				throw new Error('Failed to chunk text');
			}

			const data = await response.json();
			chunks = data.chunks;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<h1>Marmalade</h1>
	<p>Text Chunking Visualizer</p>

	<div class="input-section">
		<textarea bind:value={text} placeholder="Enter text to chunk..." rows="5"></textarea>

		<button on:click={chunkText} disabled={loading}>
			{loading ? 'Chunking...' : 'Chunk Text'}
		</button>
	</div>

	{#if error}
		<div class="error">Error: {error}</div>
	{/if}

	{#if chunks.length > 0}
		<div class="results">
			<h2>Chunks ({chunks.length})</h2>
			{#each chunks as chunk, i}
				<div class="chunk">
					<h3>Chunk {i + 1}</h3>
					<p class="chunk-text">{chunk.text}</p>
					<details>
						<summary>Tokens ({chunk.tokens.length})</summary>
						<div class="tokens">
							{#each chunk.tokens as token}
								<span class="token">{token}</span>
							{/each}
						</div>
					</details>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		color: #ff8c42;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.input-section {
		margin: 2rem 0;
	}

	textarea {
		width: 100%;
		padding: 1rem;
		font-size: 1rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		font-family: inherit;
		margin-bottom: 1rem;
	}

	button {
		background: #ff8c42;
		color: white;
		border: none;
		padding: 0.75rem 2rem;
		font-size: 1rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
	}

	button:hover:not(:disabled) {
		background: #ff7a28;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.results {
		margin-top: 2rem;
	}

	.chunk {
		background: #f9f9f9;
		border: 2px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.chunk h3 {
		margin-top: 0;
		color: #333;
	}

	.chunk-text {
		background: white;
		padding: 1rem;
		border-radius: 4px;
		font-family: monospace;
	}

	.tokens {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.token {
		background: #4a9eff;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.875rem;
	}

	details {
		margin-top: 0.5rem;
	}

	summary {
		cursor: pointer;
		font-weight: 600;
		color: #666;
	}
</style>
