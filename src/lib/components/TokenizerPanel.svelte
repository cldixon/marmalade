<script>
	import { settings } from '$lib/stores/settings.svelte.js';
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import { strategies } from '$lib/utils/strategies.js';

	/**
	 * @type {{ tokenizerLoading: boolean, tokenizerReady: boolean }}
	 */
	let { tokenizerLoading, tokenizerReady } = $props();

	let currentTokenizer = $derived(tokenizers.find((t) => t.id === settings.tokenizer.modelId));

	// Local slider state synced with store
	let localMaxTokens = $state(settings.tokenizer.maxTokens);
	let localOverlap = $state(settings.tokenizer.overlap);

	$effect(() => {
		localMaxTokens = settings.tokenizer.maxTokens;
	});
	$effect(() => {
		localOverlap = settings.tokenizer.overlap;
	});

	function selectTokenizer(id) {
		settings.tokenizer.modelId = id;
		const tok = tokenizers.find((t) => t.id === id);
		if (tok) settings.tokenizer.maxTokens = tok.contextWindow;
	}
</script>

<aside class="sidebar">
	<div class="panel-content">
		<h2 class="panel-title">Tokenizer</h2>

		<!-- Tokenizer model -->
		<div class="field">
			<label for="tokenizer-select" class="label">Model</label>
			<select
				id="tokenizer-select"
				value={settings.tokenizer.modelId}
				disabled={tokenizerLoading}
				onchange={(e) => selectTokenizer(e.target.value)}
				class="select"
				class:loading={tokenizerLoading}
			>
				{#each tokenizers as tok (tok.id)}
					<option value={tok.id}>{tok.name}</option>
				{/each}
			</select>
			{#if currentTokenizer}
				<div class="model-detail">
					<span class="model-id">{currentTokenizer.model}</span>
					<span class="model-ctx">{currentTokenizer.contextWindow} tokens</span>
					{#if tokenizerLoading}
						<span class="spinner"></span>
					{:else if tokenizerReady}
						<span class="badge badge--success">Ready</span>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Strategy -->
		<div class="field">
			<span class="label">Strategy</span>
			<div class="strategy-list">
				{#each strategies as s (s.id)}
					<button
						class="strategy-btn"
						class:active={settings.tokenizer.strategy === s.id}
						onclick={() => (settings.tokenizer.strategy = s.id)}
					>
						<span class="strategy-name">{s.name}</span>
						<span class="strategy-desc">{s.description}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Token sliders -->
		<div class="field">
			<div class="slider-header">
				<label for="max-tokens-range" class="label">Max Tokens</label>
				<span class="slider-value">{localMaxTokens}</span>
			</div>
			<input
				id="max-tokens-range"
				type="range"
				bind:value={localMaxTokens}
				min={64}
				max={currentTokenizer?.contextWindow ?? 512}
				step={64}
				onchange={() => (settings.tokenizer.maxTokens = localMaxTokens)}
				class="range"
			/>
		</div>

		{#if settings.tokenizer.strategy === 'tokens'}
			<div class="field">
				<div class="slider-header">
					<label for="overlap-range" class="label">Overlap</label>
					<span class="slider-value">{localOverlap}</span>
				</div>
				<input
					id="overlap-range"
					type="range"
					bind:value={localOverlap}
					min={0}
					max={Math.min(128, Math.floor(localMaxTokens / 2))}
					step={16}
					onchange={() => (settings.tokenizer.overlap = localOverlap)}
					class="range"
				/>
			</div>
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-width: var(--sidebar-width);
		background-color: var(--color-card);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
	}

	.panel-content {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		overflow-y: auto;
		height: 100%;
	}

	.panel-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-dark);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-dark);
	}

	.select {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
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

	.model-detail {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.model-id {
		font-size: var(--font-size-xs);
		font-family: var(--font-mono);
		color: var(--color-muted);
	}

	.model-ctx {
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.badge {
		font-size: var(--font-size-xs);
		font-weight: 600;
		padding: 1px var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.badge--success {
		color: var(--color-success);
		background-color: var(--color-success-bg);
	}

	.strategy-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.strategy-btn {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background-color: white;
		cursor: pointer;
		text-align: left;
		transition: all var(--transition-fast);
	}

	.strategy-btn:hover {
		border-color: var(--color-primary);
	}

	.strategy-btn.active {
		border-color: var(--color-primary);
		background-color: var(--color-light);
	}

	.strategy-name {
		display: block;
		font-weight: 600;
		font-size: var(--font-size-sm);
		color: var(--color-dark);
	}

	.strategy-desc {
		display: block;
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		margin-top: 2px;
	}

	.strategy-btn.active .strategy-name {
		color: var(--color-primary);
	}

	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slider-value {
		font-size: var(--font-size-sm);
		font-weight: 700;
		color: var(--color-primary);
		background-color: var(--color-light);
		padding: 1px var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.range {
		width: 100%;
		accent-color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 100%;
			min-width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}
	}
</style>
