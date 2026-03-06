<script>
	/** @type {{ chunks: string[], metadataComputing: boolean, metadataReady: boolean }} */
	let { chunks, metadataComputing, metadataReady } = $props();
</script>

{#if chunks.length > 0}
	<div class="stats-bar">
		<div class="stats-group">
			<div class="stat">
				<span class="stat-label">Chunks</span>
				<span class="stat-value stat-value--primary">{chunks.length}</span>
			</div>
			<div class="stat">
				<span class="stat-label">Avg Words</span>
				<span class="stat-value stat-value--accent">
					{Math.round(
						chunks.reduce((sum, c) => sum + c.split(/\s+/).length, 0) / chunks.length
					)}
				</span>
			</div>
		</div>
		<div class="stats-status">
			{#if metadataComputing}
				<span class="spinner"></span>
				Computing tokens...
			{:else if metadataReady}
				Token counts ready
			{/if}
		</div>
	</div>
{/if}

<style>
	.stats-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-card);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-md);
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.stats-group {
		display: flex;
		gap: var(--space-lg);
		align-items: center;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.stat-label {
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		text-transform: uppercase;
		font-weight: 600;
	}

	.stat-value {
		font-size: var(--font-size-lg);
		font-weight: bold;
	}

	.stat-value--primary {
		color: var(--color-primary);
	}

	.stat-value--accent {
		color: var(--color-accent);
	}

	.stats-status {
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}
</style>
