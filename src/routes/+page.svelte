<script>
	import { onMount } from 'svelte';
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import {
		calculateChunks,
		getChunkMetadata,
		computeAllChunkMetadata
	} from '$lib/utils/chunking.js';
	import { loadTokenizer } from '$lib/tokenizer/index.js';

	import Header from '$lib/components/Header.svelte';
	import ConfigPanel from '$lib/components/ConfigPanel.svelte';
	import StatsBar from '$lib/components/StatsBar.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import ChunkDisplay from '$lib/components/ChunkDisplay.svelte';
	import ChunkDetailPanel from '$lib/components/ChunkDetailPanel.svelte';
	import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';

	// --- State ---
	let text = $state('');
	let strategy = $state('tokens');
	let selectedTokenizer = $state('mpnet');
	let maxTokens = $state(384);
	let overlap = $state(0);

	// UI state
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

	// --- Derived ---
	let currentTokenizer = $derived(tokenizers.find((t) => t.id === selectedTokenizer));
	let chunks = $derived(calculateChunks(text, strategy, maxTokens, overlap));

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
				strategy,
				maxTokens,
				overlap,
				selectedTokenizer
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
		return getChunkMetadata(chunk, strategy, maxTokens, overlap);
	}

	// --- Event handlers ---
	function handleConfigChange(changes) {
		if ('selectedTokenizer' in changes) {
			selectedTokenizer = changes.selectedTokenizer;
			const tok = tokenizers.find((t) => t.id === changes.selectedTokenizer);
			if (tok) maxTokens = tok.contextWindow;
			initTokenizer(changes.selectedTokenizer);
		}
		if ('strategy' in changes) strategy = changes.strategy;
		if ('maxTokens' in changes) maxTokens = changes.maxTokens;
		if ('overlap' in changes) overlap = changes.overlap;
	}

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
		initTokenizer(selectedTokenizer);
		return () => document.removeEventListener('click', handleGlobalClick);
	});

	// Recompute metadata when chunks or tokenizer readiness changes
	$effect(() => {
		if (tokenizerReady && chunks.length > 0) {
			updateChunkMetadata();
		}
	});
</script>

<div class="app">
	<Header />

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
		<ConfigPanel
			{selectedTokenizer}
			{strategy}
			{maxTokens}
			{overlap}
			{tokenizerLoading}
			{tokenizerReady}
			onchange={handleConfigChange}
		/>

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
			{maxTokens}
			onclose={() => (selectedChunk = null)}
		/>
	{/if}

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
		background-color: #fee2e2;
		border-bottom: 1px solid var(--color-error);
		font-size: var(--font-size-sm);
		color: #991b1b;
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
