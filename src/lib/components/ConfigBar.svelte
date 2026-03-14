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
	let localMinChunkSize = $state(settings.tokenizer.minChunkSize);

	$effect(() => {
		localMaxTokens = settings.tokenizer.maxTokens;
	});
	$effect(() => {
		localOverlap = settings.tokenizer.overlap;
	});
	$effect(() => {
		localMinChunkSize = settings.tokenizer.minChunkSize;
	});

	function selectTokenizer(id) {
		settings.tokenizer.modelId = id;
		const tok = tokenizers.find((t) => t.id === id);
		if (tok) settings.tokenizer.maxTokens = tok.contextWindow;
	}

	function trackFill(value, min, max) {
		if (max <= min) return '0%';
		return ((value - min) / (max - min)) * 100 + '%';
	}

	let maxTokensMin = 64;
	let maxTokensMax = $derived(currentTokenizer?.contextWindow ?? 512);
	let overlapMax = $derived(Math.min(128, Math.floor(localMaxTokens / 2)));
	let minChunkMax = $derived(Math.floor(localMaxTokens / 2));
</script>

<div class="config-card">
	<!-- Row 1: Model + Strategy -->
	<div class="config-row">
		<div class="config-section">
			<span class="config-label">Model</span>
			<div class="model-group">
				<select
					value={settings.tokenizer.modelId}
					disabled={tokenizerLoading}
					onchange={(e) => selectTokenizer(e.target.value)}
					class="config-select"
					class:loading={tokenizerLoading}
				>
					{#each tokenizers as tok (tok.id)}
						<option value={tok.id}>{tok.name}</option>
					{/each}
				</select>
				{#if tokenizerLoading}
					<span class="spinner"></span>
				{:else if tokenizerReady}
					<span class="ready-dot"></span>
					<span class="ready-text">Ready</span>
				{/if}
				{#if currentTokenizer}
					<span class="context-text">{currentTokenizer.contextWindow} token context</span>
				{/if}
			</div>
		</div>

		<span class="divider"></span>

		<div class="config-section">
			<span class="config-label">Strategy</span>
			<div class="pill-group">
				{#each strategies as s (s.id)}
					<button
						class="pill"
						class:active={settings.tokenizer.strategy === s.id}
						onclick={() => (settings.tokenizer.strategy = s.id)}
						title={s.description}
					>
						{s.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Divider line -->
	<div class="row-divider"></div>

	<!-- Row 2: Sliders -->
	<div class="config-row">
		<div class="config-section config-section--slider">
			<div class="slider-label-row">
				<span class="config-label">Max Tokens</span>
				<span class="slider-badge">{localMaxTokens}</span>
			</div>
			<div class="slider-track-wrap">
				<input
					type="range"
					bind:value={localMaxTokens}
					min={maxTokensMin}
					max={maxTokensMax}
					step={64}
					onchange={() => (settings.tokenizer.maxTokens = localMaxTokens)}
					class="range"
					style="--track-fill: {trackFill(localMaxTokens, maxTokensMin, maxTokensMax)}"
				/>
			</div>
		</div>

		<span class="divider"></span>

		<div class="config-section config-section--slider">
			<div class="slider-label-row">
				<span class="config-label">Min Chunk Size</span>
				<span class="slider-badge">{localMinChunkSize}</span>
			</div>
			<div class="slider-track-wrap">
				<input
					type="range"
					bind:value={localMinChunkSize}
					min={0}
					max={minChunkMax}
					step={8}
					onchange={() => (settings.tokenizer.minChunkSize = localMinChunkSize)}
					class="range"
					style="--track-fill: {trackFill(localMinChunkSize, 0, minChunkMax)}"
				/>
			</div>
		</div>

		<span class="divider" class:hidden={settings.tokenizer.strategy !== 'tokens'}></span>

		<div
			class="config-section config-section--slider"
			class:hidden={settings.tokenizer.strategy !== 'tokens'}
		>
			<div class="slider-label-row">
				<span class="config-label">Overlap</span>
				<span class="slider-badge">{localOverlap}</span>
			</div>
			<div class="slider-track-wrap">
				<input
					type="range"
					bind:value={localOverlap}
					min={0}
					max={overlapMax}
					step={16}
					onchange={() => (settings.tokenizer.overlap = localOverlap)}
					class="range"
					style="--track-fill: {trackFill(localOverlap, 0, overlapMax)}"
				/>
			</div>
		</div>

		{#if settings.tokenizer.strategy === 'tokens' && settings.tokenizer.overlap > 0}
			<span class="divider"></span>

			<div class="config-section">
				<span class="config-label">Overlap Strategy</span>
				<div class="pill-group">
					<button
						class="pill"
						class:active={settings.tokenizer.overlapStrategy === 'token'}
						onclick={() => (settings.tokenizer.overlapStrategy = 'token')}
					>
						Token
					</button>
					<button
						class="pill"
						class:active={settings.tokenizer.overlapStrategy === 'sentence'}
						onclick={() => (settings.tokenizer.overlapStrategy = 'sentence')}
					>
						Sentence
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.config-card {
		background-color: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: clip;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.config-row {
		display: flex;
		align-items: center;
		padding: 12px 20px;
		gap: 24px;
	}

	.row-divider {
		height: 1px;
		background-color: var(--color-border);
		margin: 0 20px;
	}

	.config-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.config-section--slider {
		flex: 1;
		min-width: 0;
		gap: 12px;
	}

	.divider {
		width: 1px;
		height: 24px;
		background-color: var(--color-border);
		flex-shrink: 0;
	}

	.hidden {
		visibility: hidden;
	}

	.config-label {
		font-family: var(--font-base);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-muted-warm);
		white-space: nowrap;
		line-height: 12px;
	}

	.model-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.config-select {
		padding: 4px 8px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		font-family: var(--font-base);
		font-size: 12px;
		font-weight: 600;
		background-color: white;
		color: var(--color-dark);
		cursor: pointer;
		line-height: 16px;
	}

	.config-select.loading {
		opacity: 0.7;
		cursor: wait;
	}

	.ready-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background-color: var(--color-success);
		flex-shrink: 0;
	}

	.ready-text {
		font-family: var(--font-base);
		font-size: 10px;
		font-weight: 600;
		color: var(--color-success);
		line-height: 12px;
	}

	.context-text {
		font-family: var(--font-base);
		font-size: 10px;
		font-weight: 400;
		color: var(--color-muted-warm);
		line-height: 12px;
	}

	.pill-group {
		display: flex;
		border-radius: var(--radius-md);
		overflow: clip;
		border: 1px solid var(--color-border);
	}

	.pill {
		padding: 5px 14px;
		border: none;
		background-color: white;
		font-family: var(--font-base);
		font-size: 12px;
		font-weight: 600;
		color: var(--color-dark);
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
		line-height: 16px;
	}

	.pill:not(:first-child) {
		border-left: 1px solid var(--color-border);
	}

	.pill:hover:not(.active) {
		background-color: var(--color-light);
	}

	.pill.active {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.slider-label-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.slider-badge {
		font-family: var(--font-base);
		font-size: 12px;
		font-weight: 800;
		color: var(--color-primary);
		background-color: var(--color-chunk-even);
		padding: 1px 7px;
		border-radius: 5px;
		line-height: 16px;
	}

	.slider-track-wrap {
		flex: 1;
		min-width: 80px;
	}

	.range {
		width: 100%;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
	}

	.range::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(
			to right,
			var(--color-primary) 0%,
			var(--color-primary) var(--track-fill, 50%),
			var(--color-border) var(--track-fill, 50%),
			var(--color-border) 100%
		);
	}

	.range::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: var(--color-primary);
		border: 2px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		margin-top: -5px;
	}

	.range::-moz-range-track {
		height: 6px;
		border-radius: 3px;
		background: var(--color-border);
	}

	.range::-moz-range-progress {
		height: 6px;
		border-radius: 3px;
		background: var(--color-primary);
	}

	.range::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: var(--color-primary);
		border: 2px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	@media (max-width: 768px) {
		.config-row {
			flex-wrap: wrap;
			gap: 12px;
			padding: 12px 16px;
		}

		.row-divider {
			margin: 0 16px;
		}

		.divider {
			display: none;
		}

		.slider-track-wrap {
			min-width: 100px;
		}
	}
</style>
