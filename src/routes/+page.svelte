<script>
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores/settings.svelte.js';
	import { apiKey } from '$lib/stores/apikey.svelte.js';
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import {
		calculateChunksReal,
		mergeSmallTrailingChunk,
		buildChunkMetadata
	} from '$lib/utils/chunking.js';
	import { loadTokenizer } from '$lib/tokenizer/index.js';
	import { getRandomSample } from '$lib/data/samples.js';

	import Header from '$lib/components/Header.svelte';
	import WelcomeBanner from '$lib/components/WelcomeBanner.svelte';
	import ConfigBar from '$lib/components/ConfigBar.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import ChunkDisplay from '$lib/components/ChunkDisplay.svelte';
	import ChunkDetailPanel from '$lib/components/ChunkDetailPanel.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// --- Local state (UI-only, not shared) ---
	let text = $state('');
	let settingsModalOpen = $state(false);
	let hoveredChunk = $state(null);
	let selectedChunk = $state(null);
	let isEditing = $state(false);
	let welcomeDismissed = $state(false);

	// Tokenizer loading state
	let tokenizerLoading = $state(false);
	let tokenizerReady = $state(false);
	let tokenizerError = $state(null);

	// Chunk computation state
	/** @type {{ chunks: import('$lib/utils/chunking.js').ChunkInfo[], totalTokens: number, tokenization: any } | null} */
	let chunkResult = $state(null);
	let chunksComputing = $state(false);
	let chunkGeneration = 0;

	// --- Derived (from settings store) ---
	let currentTokenizer = $derived(
		tokenizers.find((t) => t.id === settings.tokenizer.modelId)
	);
	let chunks = $derived(chunkResult?.chunks ?? []);
	let totalTokens = $derived(chunkResult?.totalTokens ?? 0);
	let totalWords = $derived(
		chunks.reduce((sum, c) => sum + c.text.split(/\s+/).length, 0)
	);
	let avgWords = $derived(
		chunks.length > 0 ? Math.round(totalWords / chunks.length) : 0
	);

	// --- Tokenizer management ---
	async function initTokenizer(tokenizerId) {
		tokenizerLoading = true;
		tokenizerReady = false;
		tokenizerError = null;

		try {
			await loadTokenizer(tokenizerId);
			tokenizerReady = true;
		} catch (err) {
			console.error('Failed to load tokenizer:', err);
			tokenizerError = err.message;
		} finally {
			tokenizerLoading = false;
		}
	}

	function getMetadata(idx) {
		if (!chunks[idx]) return null;
		return buildChunkMetadata(
			chunks[idx],
			settings.tokenizer.strategy,
			settings.tokenizer.maxTokens,
			settings.tokenizer.overlap
		);
	}

	function dismissWelcome() {
		if (!welcomeDismissed) {
			welcomeDismissed = true;
			localStorage.setItem('marmalade_welcomed', 'true');
		}
	}

	// --- Event handlers ---
	function handleGlobalClick(event) {
		const clickedChunk = event.target.closest('span[role="button"]');
		const clickedSidePanel = event.target.closest('[data-side-panel]');

		if (!clickedChunk && !clickedSidePanel && selectedChunk !== null) {
			selectedChunk = null;
		}
	}

	// --- Lifecycle ---
	onMount(() => {
		document.addEventListener('click', handleGlobalClick);
		apiKey.load();
		initTokenizer(settings.tokenizer.modelId);

		// Auto-load sample text on first visit
		if (!localStorage.getItem('marmalade_welcomed')) {
			const sample = getRandomSample();
			text = sample.text;
		} else {
			welcomeDismissed = true;
		}

		return () => document.removeEventListener('click', handleGlobalClick);
	});

	// Re-init tokenizer when model changes
	$effect(() => {
		const modelId = settings.tokenizer.modelId;
		initTokenizer(modelId);
	});

	// Compute chunks using real tokenization
	$effect(() => {
		const currentText = text;
		const { strategy, maxTokens, overlap, overlapStrategy, minChunkSize, modelId } = settings.tokenizer;
		const ready = tokenizerReady;

		if (!ready || !currentText) {
			chunkResult = null;
			return;
		}

		const gen = ++chunkGeneration;
		chunksComputing = true;

		calculateChunksReal(currentText, strategy, maxTokens, overlap, overlapStrategy, modelId)
			.then((result) => {
				if (gen !== chunkGeneration) return;
				result.chunks = mergeSmallTrailingChunk(result.chunks, minChunkSize, maxTokens);
				result.totalTokens = result.chunks.reduce((s, c) => s + c.tokenCount, 0);
				chunkResult = result;
			})
			.catch((err) => {
				if (gen !== chunkGeneration) return;
				console.error('Failed to compute chunks:', err);
				chunkResult = null;
			})
			.finally(() => {
				if (gen === chunkGeneration) chunksComputing = false;
			});
	});
</script>

<div class="app">
	<Header onopenSettings={() => (settingsModalOpen = true)} />

	{#if !welcomeDismissed}
		<WelcomeBanner ondismiss={dismissWelcome} />
	{/if}

	{#if tokenizerLoading}
		<div class="loading-banner">
			<span class="spinner spinner--lg"></span>
			<span>Loading tokenizer: {currentTokenizer?.model}...</span>
		</div>
	{/if}

	{#if tokenizerError}
		<div class="error-banner">
			Failed to load tokenizer: {tokenizerError}
		</div>
	{/if}

	<div class="body">
		<ConfigBar {tokenizerLoading} {tokenizerReady} />

		<div class="content-card">
			<div class="content-header">
				<div class="content-header-left">
					<h2 class="content-title">{chunks.length > 0 ? 'Chunks' : 'Text'}</h2>
					{#if chunks.length > 0}
						<div class="stats-pill">
							<span class="stat">
								<span class="stat-label">Chunks</span>
								<span class="stat-value stat-value--primary">{chunks.length}</span>
							</span>
							<span class="stat-divider"></span>
							<span class="stat">
								<span class="stat-label">Avg</span>
								<span class="stat-value stat-value--accent">{avgWords}w</span>
							</span>
							<span class="stat-divider"></span>
							<span class="stat">
								<span class="stat-label">Tokens</span>
								<span class="stat-value stat-value--brown">{totalTokens}</span>
							</span>
							{#if chunksComputing}
								<span class="spinner"></span>
							{/if}
						</div>
					{/if}
				</div>

				<div class="content-actions">
					<TextInput
						{text}
						{isEditing}
						onchange={(val) => { text = val; dismissWelcome(); }}
						ontoggleedit={() => (isEditing = !isEditing)}
						headerMode={true}
					/>
				</div>
			</div>

			<TextInput
				{text}
				{isEditing}
				onchange={(val) => { text = val; dismissWelcome(); }}
				ontoggleedit={() => (isEditing = !isEditing)}
			/>

			{#if text !== '' && !isEditing}
				<ChunkDisplay
					chunks={chunks.map((c) => c.text)}
					{getMetadata}
					{hoveredChunk}
					{selectedChunk}
					onhover={(idx) => (hoveredChunk = idx)}
					onselect={(idx) => (selectedChunk = idx)}
				/>
			{/if}
		</div>
	</div>

	{#if selectedChunk !== null && chunks[selectedChunk]}
		<ChunkDetailPanel
			index={selectedChunk}
			chunk={chunks[selectedChunk].text}
			metadata={getMetadata(selectedChunk)}
			maxTokens={settings.tokenizer.maxTokens}
			onclose={() => (selectedChunk = null)}
		/>
	{/if}

	<SettingsModal
		open={settingsModalOpen}
		onclose={() => (settingsModalOpen = false)}
	/>

	<Footer />
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.loading-banner {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) 48px;
		background-color: var(--color-light);
		border-bottom: 1px solid var(--color-border);
		font-size: 12px;
		color: var(--color-dark);
	}

	.error-banner {
		padding: var(--space-sm) 48px;
		background-color: var(--color-error-bg);
		border-bottom: 1px solid var(--color-error);
		font-size: 12px;
		color: var(--color-error-text);
		font-weight: 500;
	}

	.body {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 24px 48px;
		gap: 16px;
		min-height: 0;
		overflow-y: auto;
		max-width: var(--max-width);
		width: 100%;
		margin: 0 auto;
	}

	.content-card {
		flex: 1;
		background-color: var(--color-card);
		border-radius: var(--radius-lg);
		padding: 24px 28px;
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.content-header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.content-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 600;
		color: var(--color-dark);
		line-height: 18px;
	}

	.stats-pill {
		display: flex;
		align-items: center;
		gap: 12px;
		background-color: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 4px 14px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.stat-label {
		font-family: var(--font-base);
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-muted-warm);
		line-height: 12px;
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
		line-height: 18px;
	}

	.stat-value--primary {
		color: var(--color-primary);
	}

	.stat-value--accent {
		color: var(--color-accent);
	}

	.stat-value--brown {
		color: var(--color-brown);
	}

	.stat-divider {
		width: 1px;
		height: 14px;
		background-color: var(--color-border);
	}

	.content-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	@media (max-width: 768px) {
		.body {
			padding: 16px;
		}

		.content-card {
			padding: 16px;
		}

		.content-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}
	}
</style>
