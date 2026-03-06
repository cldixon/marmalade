<script>
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import { strategies } from '$lib/utils/strategies.js';

	/**
	 * @type {{
	 *   selectedTokenizer: string,
	 *   strategy: string,
	 *   maxTokens: number,
	 *   overlap: number,
	 *   tokenizerLoading: boolean,
	 *   tokenizerReady: boolean,
	 *   collapsed: boolean,
	 *   onchange: (changes: Record<string, any>) => void,
	 *   ontoggle: () => void
	 * }}
	 */
	let {
		selectedTokenizer,
		strategy,
		maxTokens,
		overlap,
		tokenizerLoading,
		tokenizerReady,
		collapsed,
		onchange,
		ontoggle
	} = $props();

	let currentTokenizer = $derived(tokenizers.find((t) => t.id === selectedTokenizer));
</script>

<!-- Collapsed: just a toggle button -->
{#if collapsed}
	<button class="sidebar-toggle" onclick={ontoggle} aria-label="Open settings">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	</button>
{:else}
	<!-- Expanded sidebar -->
	<aside class="sidebar">
		<div class="sidebar-header">
			<h3 class="sidebar-title">Settings</h3>
			<button class="sidebar-close" onclick={ontoggle} aria-label="Close settings">×</button>
		</div>

		<!-- Tokenizer -->
		<div class="section">
			<label for="tokenizer-select" class="label">Tokenizer</label>
			<select
				id="tokenizer-select"
				value={selectedTokenizer}
				disabled={tokenizerLoading}
				onchange={(e) => onchange({ selectedTokenizer: e.target.value })}
				class="select"
				class:loading={tokenizerLoading}
			>
				{#each tokenizers as tok (tok.id)}
					<option value={tok.id}>{tok.name} ({tok.contextWindow})</option>
				{/each}
			</select>
			{#if currentTokenizer}
				<div class="model-info">
					<span class="model-name">{currentTokenizer.model}</span>
					<div class="model-meta">
						<span class="badge badge--accent">{currentTokenizer.contextWindow} tokens</span>
						{#if tokenizerLoading}
							<span class="spinner"></span>
						{:else if tokenizerReady}
							<span class="badge badge--success">Ready</span>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Strategy -->
		<div class="section">
			<span class="label">Strategy</span>
			<div class="strategy-grid" role="group" aria-label="Chunking strategy">
				{#each strategies as s (s.id)}
					<button
						class="strategy-btn"
						class:active={strategy === s.id}
						onclick={() => onchange({ strategy: s.id })}
					>
						{s.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- Token Settings -->
		{#if strategy === 'tokens' || strategy === 'hybrid'}
			<div class="section">
				<div class="slider-header">
					<label for="max-tokens-range" class="label">Max Tokens</label>
					<span class="slider-value">{maxTokens}</span>
				</div>
				<input
					id="max-tokens-range"
					type="range"
					value={maxTokens}
					min="64"
					max={currentTokenizer?.contextWindow ?? 512}
					step="64"
					oninput={(e) => onchange({ maxTokens: parseInt(e.target.value) })}
					class="range"
				/>
			</div>

			{#if strategy === 'tokens'}
				<div class="section">
					<div class="slider-header">
						<label for="overlap-range" class="label">Overlap</label>
						<span class="slider-value">{overlap}</span>
					</div>
					<input
						id="overlap-range"
						type="range"
						value={overlap}
						min="0"
						max={Math.min(128, Math.floor(maxTokens / 2))}
						step="16"
						oninput={(e) => onchange({ overlap: parseInt(e.target.value) })}
						class="range"
					/>
				</div>
			{/if}
		{/if}
	</aside>
{/if}

<style>
	.sidebar-toggle {
		position: fixed;
		left: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		z-index: 20;
		background-color: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm);
		cursor: pointer;
		color: var(--color-dark);
		box-shadow: var(--shadow-md);
		transition: background-color var(--transition-fast);
	}

	.sidebar-toggle:hover {
		background-color: var(--color-light);
	}

	.sidebar {
		width: var(--sidebar-width);
		background-color: var(--color-card);
		border-right: 1px solid var(--color-border);
		padding: var(--space-lg);
		overflow-y: auto;
		height: 100%;
		flex-shrink: 0;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.sidebar-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-dark);
	}

	.sidebar-close {
		background: none;
		border: none;
		font-size: var(--font-size-xl);
		cursor: pointer;
		color: var(--color-muted);
		line-height: 1;
		padding: 0;
	}

	.sidebar-close:hover {
		color: var(--color-dark);
	}

	.section {
		margin-bottom: var(--space-lg);
	}

	.label {
		display: block;
		margin-bottom: var(--space-sm);
		font-weight: 600;
		font-size: var(--font-size-sm);
		color: var(--color-dark);
	}

	.select {
		width: 100%;
		padding: var(--space-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		font-size: var(--font-size-sm);
		background-color: white;
		color: var(--color-dark);
		cursor: pointer;
		font-weight: 500;
	}

	.select.loading {
		opacity: 0.7;
		cursor: wait;
	}

	.model-info {
		margin-top: var(--space-sm);
		padding: var(--space-sm);
		background-color: var(--color-light);
		border-radius: var(--radius-sm);
	}

	.model-name {
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
		color: var(--color-muted);
		display: block;
		margin-bottom: var(--space-xs);
	}

	.model-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.badge {
		font-size: var(--font-size-xs);
		font-weight: 600;
		padding: 2px var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.badge--accent {
		color: var(--color-accent);
		background-color: var(--color-card);
	}

	.badge--success {
		color: var(--color-success);
		background-color: #d1fae5;
	}

	.strategy-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-xs);
	}

	.strategy-btn {
		padding: var(--space-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background-color: white;
		cursor: pointer;
		font-weight: 500;
		font-size: var(--font-size-xs);
		color: var(--color-dark);
		transition: all var(--transition-fast);
	}

	.strategy-btn:hover {
		border-color: var(--color-primary);
	}

	.strategy-btn.active {
		border-color: var(--color-primary);
		background-color: var(--color-light);
		color: var(--color-primary);
		font-weight: 600;
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xs);
	}

	.slider-value {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-primary);
		background-color: var(--color-light);
		padding: 2px var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.range {
		width: 100%;
		accent-color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 30;
			box-shadow: var(--shadow-lg);
		}
	}
</style>
