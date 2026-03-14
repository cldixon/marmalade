<script>
	import { settings } from '$lib/stores/settings.svelte.js';
	import { apiKey } from '$lib/stores/apikey.svelte.js';
	import { getEmbedding } from '$lib/services/openai.js';

	/**
	 * @type {{
	 *   index: number,
	 *   chunk: string,
	 *   metadata: import('$lib/utils/chunking.js').ChunkMetadata,
	 *   maxTokens: number,
	 *   onclose: () => void
	 * }}
	 */
	let { index, chunk, metadata, maxTokens, onclose } = $props();

	let curlCopied = $state(false);
	let embeddingLoading = $state(false);
	let embeddingError = $state(null);
	let embeddingResult = $state(null);

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	function buildCurlCommand() {
		const escaped = chunk.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
		const model = settings.embedding.model;
		const dims = settings.embedding.dimensions;
		const bodyObj = { input: escaped, model };
		if (dims) bodyObj.dimensions = dims;

		const bodyJson = JSON.stringify(bodyObj, null, 2);
		return `curl https://api.openai.com/v1/embeddings \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${bodyJson}'`;
	}

	function copyCurl() {
		navigator.clipboard.writeText(buildCurlCommand());
		curlCopied = true;
		setTimeout(() => (curlCopied = false), 2000);
	}

	async function fetchEmbedding() {
		embeddingLoading = true;
		embeddingError = null;
		embeddingResult = null;

		try {
			const result = await getEmbedding(chunk, {
				apiKey: apiKey.value,
				model: settings.embedding.model,
				dimensions: settings.embedding.dimensions
			});
			embeddingResult = result;
		} catch (err) {
			embeddingError = err.message;
		} finally {
			embeddingLoading = false;
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="panel" data-side-panel onclick={(e) => e.stopPropagation()}>
	<div class="panel-header">
		<h4 class="panel-title">Chunk {index + 1}</h4>
		<button class="panel-close" onclick={onclose}>×</button>
	</div>

	<div class="stats">
		{#each [
			['Tokens', `${metadata.tokens} / ${maxTokens}`],
			['Utilization', `${metadata.utilization}%`],
			['Words', metadata.words],
			['Characters', metadata.chars],
			['Sentences', metadata.sentences]
		] as [label, value] (label)}
			<div class="stat-row">
				<span class="stat-label">{label}</span>
				<span class="stat-value">{value}</span>
			</div>
		{/each}

		{#if metadata.overlapTokens > 0}
			<div class="stat-row">
				<span class="stat-label">Overlap</span>
				<span class="stat-value">{metadata.overlapTokens} tokens</span>
			</div>
		{/if}
	</div>

	<div class="actions">
		<button class="btn-action btn-copy" onclick={() => copyToClipboard(chunk)}>
			Copy Text
		</button>
		<button
			class="btn-action btn-curl"
			onclick={copyCurl}
			title="curl command for OpenAI {settings.embedding.model}"
		>
			{curlCopied ? 'Copied!' : 'Copy Embedding Request'}
		</button>
		<button
			class="btn-action btn-embed"
			onclick={fetchEmbedding}
			disabled={!apiKey.isSet || embeddingLoading}
			title={apiKey.isSet ? `Call OpenAI ${settings.embedding.model}` : 'Set API key in Embeddings settings'}
		>
			{#if embeddingLoading}
				<span class="spinner"></span> Embedding...
			{:else}
				Get Embedding
			{/if}
		</button>
	</div>

	<!-- Embedding result -->
	{#if embeddingError}
		<div class="embed-error">{embeddingError}</div>
	{/if}

	{#if embeddingResult}
		{@const embedding = embeddingResult.data[0].embedding}
		{@const usage = embeddingResult.usage}
		<div class="embed-result">
			<div class="embed-header">
				<span class="embed-title">Embedding</span>
				<button
					class="embed-copy"
					onclick={() => copyToClipboard(JSON.stringify(embedding))}
				>
					Copy Vector
				</button>
			</div>
			<div class="embed-meta">
				<span>{embedding.length} dimensions</span>
				<span>{usage.prompt_tokens} prompt tokens</span>
			</div>
			<div class="embed-preview">
				[{embedding.slice(0, 6).map((v) => v.toFixed(6)).join(', ')}, ...]
			</div>
		</div>
	{/if}
</div>

<style>
	.panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 320px;
		height: 100vh;
		background-color: var(--color-card);
		border-left: 1px solid var(--color-border);
		padding: var(--space-lg);
		overflow-y: auto;
		z-index: 30;
		box-shadow: -4px 0 12px rgba(0, 0, 0, 0.08);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.panel-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-dark);
	}

	.panel-close {
		background: none;
		border: none;
		font-size: var(--font-size-xl);
		cursor: pointer;
		color: var(--color-muted);
		line-height: 1;
		padding: 0;
	}

	.panel-close:hover {
		color: var(--color-dark);
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-lg);
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		padding: var(--space-sm);
		background-color: var(--color-bg);
		border-radius: var(--radius-sm);
	}

	.stat-label {
		color: var(--color-muted);
		font-size: var(--font-size-sm);
	}

	.stat-value {
		font-weight: 600;
		font-size: var(--font-size-sm);
		color: var(--color-dark);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.btn-action {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: opacity var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
	}

	.btn-action:hover:not(:disabled) {
		opacity: 0.9;
	}

	.btn-action:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-copy {
		background-color: var(--color-accent);
		color: white;
	}

	.btn-curl {
		background-color: var(--color-dark);
		color: white;
	}

	.btn-embed {
		background-color: var(--color-primary);
		color: white;
	}

	/* Embedding result */
	.embed-error {
		margin-top: var(--space-md);
		padding: var(--space-sm);
		background-color: var(--color-error-bg);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		color: var(--color-error-text);
	}

	.embed-result {
		margin-top: var(--space-md);
		padding: var(--space-md);
		background-color: var(--color-bg);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.embed-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.embed-title {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: var(--color-dark);
	}

	.embed-copy {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 2px var(--space-sm);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		cursor: pointer;
		font-weight: 600;
	}

	.embed-copy:hover {
		border-color: var(--color-dark);
		color: var(--color-dark);
	}

	.embed-meta {
		display: flex;
		gap: var(--space-md);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		margin-bottom: var(--space-sm);
	}

	.embed-preview {
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
		color: var(--color-dark);
		word-break: break-all;
		line-height: 1.5;
	}
</style>
