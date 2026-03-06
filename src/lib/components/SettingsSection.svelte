<script>
	/**
	 * Reusable accordion section for the settings sidebar.
	 * @type {{ title: string, expanded?: boolean, children: import('svelte').Snippet }}
	 */
	let { title, expanded = $bindable(true), children } = $props();
</script>

<div class="section" class:collapsed={!expanded}>
	<button class="section-header" onclick={() => (expanded = !expanded)}>
		<span class="section-title">{title}</span>
		<span class="section-chevron">{expanded ? '−' : '+'}</span>
	</button>
	{#if expanded}
		<div class="section-body">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.section {
		border-top: 1px solid var(--color-border);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--space-sm) 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-dark);
		transition: color var(--transition-fast);
	}

	.section-header:hover {
		color: var(--color-primary);
	}

	.section-title {
		font-size: var(--font-size-sm);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.section-chevron {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-muted);
		line-height: 1;
	}

	.section-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding-bottom: var(--space-md);
	}
</style>
