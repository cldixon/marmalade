<script>
	/**
	 * Minimal hover tooltip — one line of key info.
	 * @type {{ index: number, metadata: import('$lib/utils/chunking.js').ChunkMetadata }}
	 */
	let { index, metadata } = $props();
</script>

<span class="tooltip">
	Chunk {index + 1} · {metadata.tokens} tokens · {metadata.quality}
	{#if metadata.isEstimated}<span class="est">~</span>{/if}
</span>

<style>
	.tooltip {
		position: absolute;
		top: -2.25rem;
		left: 0;
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: var(--color-dark);
		background-color: var(--color-card);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		white-space: nowrap;
		z-index: 10;
		box-shadow: var(--shadow-md);
		pointer-events: none;
	}

	.est {
		color: var(--color-warning);
	}
</style>
