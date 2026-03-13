<script>
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores/settings.svelte.js';
	import { apiKey } from '$lib/stores/apikey.svelte.js';
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import {
		calculateChunks,
		getChunkMetadata,
		computeAllChunkMetadata
	} from '$lib/utils/chunking.js';
	import { loadTokenizer } from '$lib/tokenizer/index.js';

	import Header from '$lib/components/Header.svelte';
	import TokenizerPanel from '$lib/components/TokenizerPanel.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import StatsBar from '$lib/components/StatsBar.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import ChunkDisplay from '$lib/components/ChunkDisplay.svelte';
	import ChunkDetailPanel from '$lib/components/ChunkDetailPanel.svelte';
	import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';

	// --- Local state (UI-only, not shared) ---
	let text = $state('');
	let settingsModalOpen = $state(false);
	let hoveredChunk = $state(null);
	let selectedChunk = $state(null);
	let isEditing = $state(false);

	// Tokenizer loading state
	let tokenizerLoading = $state(false);
	let tokenizerReady = $state(false);
	let tokenizerError = $state(null);

	// Chunk metadata
	/** @type {Map<number, import('$lib/utils/chunking.js').ChunkMetadata>} */
	let chunkMetadataMap = $state(new Map());
	let metadataComputing = $state(false);

	// --- Derived (from settings store) ---
	let currentTokenizer = $derived(
		tokenizers.find((t) => t.id === settings.tokenizer.modelId)
	);
	let chunks = $derived(
		calculateChunks(
			text,
			settings.tokenizer.strategy,
			settings.tokenizer.maxTokens,
			settings.tokenizer.overlap
		)
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

	async function updateChunkMetadata() {
		if (!tokenizerReady || chunks.length === 0) {
			chunkMetadataMap = new Map();
			return;
		}

		metadataComputing = true;
		try {
			chunkMetadataMap = await computeAllChunkMetadata(
				chunks,
				settings.tokenizer.strategy,
				settings.tokenizer.maxTokens,
				settings.tokenizer.overlap,
				settings.tokenizer.modelId
			);
		} catch (err) {
			console.error('Failed to compute chunk metadata:', err);
			chunkMetadataMap = new Map();
		} finally {
			metadataComputing = false;
		}
	}

	function getMetadata(idx, chunk) {
		if (chunkMetadataMap.has(idx)) {
			return chunkMetadataMap.get(idx);
		}
		return getChunkMetadata(
			chunk,
			settings.tokenizer.strategy,
			settings.tokenizer.maxTokens,
			settings.tokenizer.overlap
		);
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
		return () => document.removeEventListener('click', handleGlobalClick);
	});

	// Re-init tokenizer when model changes
	$effect(() => {
		const modelId = settings.tokenizer.modelId;
		initTokenizer(modelId);
	});

	// Recompute metadata when chunks or tokenizer readiness changes
	$effect(() => {
		if (tokenizerReady && chunks.length > 0) {
			updateChunkMetadata();
		}
	});
</script>

<div class="app">
	<Header onopenSettings={() => (settingsModalOpen = true)} />

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
		<TokenizerPanel {tokenizerLoading} {tokenizerReady} />

		<main class="main">
			<StatsBar
				{chunks}
				{metadataComputing}
				metadataReady={chunkMetadataMap.size > 0}
			/>

			<div class="content-card">
				<TextInput
					{text}
					{isEditing}
					onchange={(val) => (text = val)}
					ontoggleedit={() => (isEditing = !isEditing)}
				/>

				{#if text !== '' && !isEditing}
					<ChunkDisplay
						{chunks}
						{getMetadata}
						{hoveredChunk}
						{selectedChunk}
						onhover={(idx) => (hoveredChunk = idx)}
						onselect={(idx) => (selectedChunk = idx)}
					/>
				{/if}
			</div>
		</main>
	</div>

	{#if selectedChunk !== null && chunks[selectedChunk]}
		<ChunkDetailPanel
			index={selectedChunk}
			chunk={chunks[selectedChunk]}
			metadata={getMetadata(selectedChunk, chunks[selectedChunk])}
			maxTokens={settings.tokenizer.maxTokens}
			onclose={() => (selectedChunk = null)}
		/>
	{/if}

	<SettingsModal
		open={settingsModalOpen}
		onclose={() => (settingsModalOpen = false)}
	/>

	<PrivacyNotice />
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
		padding: var(--space-sm) var(--space-xl);
		background-color: var(--color-light);
		border-bottom: 1px solid var(--color-border);
		font-size: var(--font-size-sm);
		color: var(--color-dark);
	}

	.error-banner {
		padding: var(--space-sm) var(--space-xl);
		background-color: var(--color-error-bg);
		border-bottom: 1px solid var(--color-error);
		font-size: var(--font-size-sm);
		color: var(--color-error-text);
		font-weight: 500;
	}

	.body {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	.main {
		flex: 1;
		padding: var(--space-lg) var(--space-xl);
		min-width: 0;
		overflow-y: auto;
	}

	.content-card {
		background-color: var(--color-card);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		border: 1px solid var(--color-border);
		min-height: 400px;
	}

	@media (max-width: 768px) {
		.body {
			flex-direction: column;
		}

		.main {
			padding: var(--space-md);
		}
	}
</style>
