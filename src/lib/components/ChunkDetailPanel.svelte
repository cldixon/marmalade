<script>
	/**
	 * Stripped-down side panel for selected chunk details.
	 * @type {{
	 *   index: number,
	 *   chunk: string,
	 *   metadata: import('$lib/utils/chunking.js').ChunkMetadata,
	 *   maxTokens: number,
	 *   onclose: () => void
	 * }}
	 */
	let { index, chunk, metadata, maxTokens, onclose } = $props();

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="panel" data-side-panel onclick={(e) => e.stopPropagation()}>
	<div class="panel-header">
		<h4 class="panel-title">
			Chunk {index + 1}
			{#if metadata.isEstimated}
				<span class="estimated">~est</span>
			{/if}
		</h4>
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

	<div class="quality">
		<span class="quality-badge" class:excellent={metadata.quality === 'Excellent'} class:good={metadata.quality === 'Good'} class:warning={metadata.quality === 'Warning'} class:low={metadata.quality === 'Low'}>
			{metadata.quality}
		</span>
	</div>

	<button class="btn-copy" onclick={() => copyToClipboard(chunk)}>
		Copy Text
	</button>
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

	.estimated {
		font-size: var(--font-size-xs);
		color: var(--color-warning);
		font-weight: normal;
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

	.quality {
		margin-bottom: var(--space-lg);
	}

	.quality-badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--font-size-sm);
	}

	.quality-badge.excellent {
		background-color: #d1fae5;
		color: var(--color-success);
	}

	.quality-badge.good {
		background-color: var(--color-light);
		color: var(--color-primary);
	}

	.quality-badge.warning {
		background-color: #fef3c7;
		color: var(--color-warning);
	}

	.quality-badge.low {
		background-color: #fee2e2;
		color: var(--color-error);
	}

	.btn-copy {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: opacity var(--transition-fast);
	}

	.btn-copy:hover {
		opacity: 0.9;
	}
</style>
