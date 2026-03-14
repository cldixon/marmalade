<script>
	import ChunkTooltip from './ChunkTooltip.svelte';

	/**
	 * @type {{
	 *   chunks: string[],
	 *   getMetadata: (idx: number, chunk: string) => import('$lib/utils/chunking.js').ChunkMetadata,
	 *   hoveredChunk: number | null,
	 *   selectedChunk: number | null,
	 *   onhover: (idx: number | null) => void,
	 *   onselect: (idx: number | null) => void
	 * }}
	 */
	let { chunks, getMetadata, hoveredChunk, selectedChunk, onhover, onselect } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="chunk-display"
	onclick={(e) => {
		if (e.target.closest('span[role="button"]') === null) {
			onselect(null);
		}
	}}
>
	{#each chunks as chunk, idx (idx)}
		{@const isActive = hoveredChunk === idx || selectedChunk === idx}
		{@const metadata = getMetadata(idx, chunk)}

		<span
			role="button"
			tabindex="0"
			class="chunk"
			class:chunk--active={isActive}
			class:chunk--even={idx % 2 === 0}
			class:chunk--odd={idx % 2 !== 0}
			onmouseenter={() => onhover(idx)}
			onmouseleave={() => onhover(null)}
			onclick={(e) => {
				e.stopPropagation();
				onselect(idx === selectedChunk ? null : idx);
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onselect(idx === selectedChunk ? null : idx);
				}
			}}
		>
			{#if hoveredChunk === idx && selectedChunk !== idx}
				<ChunkTooltip index={idx} {metadata} />
			{/if}
			{chunk}
		</span>
	{/each}
</div>

<style>
	.chunk-display {
		font-family: var(--font-base);
		font-size: 14px;
		line-height: 24px;
		color: var(--color-dark);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.chunk {
		border-radius: 10px;
		transition: all var(--transition-base);
		cursor: pointer;
		display: block;
		position: relative;
		padding: 10px 14px;
	}

	.chunk--even {
		background-color: var(--color-chunk-even);
		border-left: 3px solid var(--color-primary);
	}

	.chunk--odd {
		background-color: var(--color-chunk-odd);
		border-left: 3px solid var(--color-accent);
	}

	.chunk--active {
		box-shadow: var(--shadow-md);
	}

	.chunk--active.chunk--even {
		border-left-width: 4px;
		background-color: var(--color-chunk-even-active);
	}

	.chunk--active.chunk--odd {
		border-left-width: 4px;
		background-color: var(--color-chunk-odd-active);
	}
</style>
