<script>
	import { onMount } from 'svelte';
	import { themes } from '$lib/utils/themes.js';
	import { tokenizers } from '$lib/utils/tokenizers.js';
	import { strategies } from '$lib/utils/strategies.js';
	import { calculateChunks, getChunkColor, getChunkMetadata } from '$lib/utils/chunking.js';

	// State
	let text = '';
	let strategy = 'tokens';
	let selectedTokenizer = 'mpnet';
	let maxTokens = 384;
	let overlap = 0;
	let showAdvanced = false;
	let hoveredChunk = null;
	let selectedChunk = null;
	let isEditing = false;

	// Handle Done/Edit button click
	function toggleEditMode() {
		isEditing = !isEditing;
	}

	// Handle blur - exit edit mode when clicking outside
	function handleBlur(event) {
		// Small delay to allow button click to process first
		setTimeout(() => {
			if (isEditing && text !== '') {
				isEditing = false;
			}
		}, 100);
	}

	// Global click handler to close side panel when clicking outside
	function handleGlobalClick(event) {
		// Check if click is outside of chunks and side panel
		const clickedChunk = event.target.closest('span[role="button"]');
		const clickedSidePanel = event.target.closest('[data-side-panel]');

		if (!clickedChunk && !clickedSidePanel && selectedChunk !== null) {
			selectedChunk = null;
		}
	}

	// Add/remove global click listener
	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleGlobalClick);
		}

		return () => {
			if (typeof document !== 'undefined') {
				document.removeEventListener('click', handleGlobalClick);
			}
		};
	});

	// Reactive computed values
	const currentTheme = themes.classic;
	$: currentTokenizer = tokenizers.find((t) => t.id === selectedTokenizer);
	$: chunks = calculateChunks(text, strategy, maxTokens, overlap);

	// Update maxTokens when tokenizer changes
	$: if (currentTokenizer) {
		maxTokens = currentTokenizer.contextWindow;
	}

	const sampleText = `Marmalade sandwiches are Paddington Bear's favorite food in the world. Paddington's Aunt Lucy taught him how to make marmalade sandwiches back in the jungles of Darkest Peru. His Uncle Pastuzo always kept a marmalade sandwich under his red bucket hat 'in case of emergency'.

Oranges and sugar are used to make the marmalade, then it is spread between two pieces of bread to make a marmalade sandwich. To be a Proper Marmalade Sandwich, it must be made of the best marmalade you can find all around and fresh-sliced bread. Paddington likes the chipped Seville orange marmalade, with chunks of pith in.`;

	function getQualityColor(quality) {
		if (quality === 'Excellent') return currentTheme.accent;
		if (quality === 'Warning') return '#F59E0B';
		if (quality === 'Low') return '#EF4444';
		return currentTheme.primary;
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}
</script>

<div
	style="background-color: {currentTheme.background}; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
>
	<!-- Header -->
	<header
		style="background-color: {currentTheme.primary}; color: white; padding: 1.5rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
	>
		<div style="max-width: 1400px; margin: 0 auto;">
			<h1 style="margin: 0; font-size: 2rem; font-weight: bold;">🫙 Marmalade</h1>
			<p style="margin: 0.25rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">
				Visualize your text chunks
			</p>
		</div>
	</header>

	<div style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
		<!-- Chunking Settings -->
		{#if showAdvanced}
			<div
				style="background-color: {currentTheme.cardBg}; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: {currentTheme.isDark
					? '0 2px 8px rgba(0,0,0,0.4)'
					: '0 2px 8px rgba(0,0,0,0.1)'}; border: 2px solid {currentTheme.border};"
			>
				<div
					style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;"
				>
					<h3 style="margin: 0; color: {currentTheme.dark}; font-size: 1.1rem;">
						Chunking Settings
					</h3>
					<button
						on:click={() => (showAdvanced = false)}
						style="background: none; border: none; color: {currentTheme.dark}; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0;"
						>×</button
					>
				</div>

				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
					<!-- Tokenizer -->
					<div>
						<label
							style="display: block; margin-bottom: 0.5rem; color: {currentTheme.dark}; font-weight: 600; font-size: 0.95rem;"
							>Tokenizer Model</label
						>
						<select
							bind:value={selectedTokenizer}
							style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 2px solid {currentTheme.border}; font-size: 0.95rem; background-color: {currentTheme.isDark
								? currentTheme.background
								: 'white'}; color: {currentTheme.dark}; cursor: pointer; font-weight: 500;"
						>
							{#each tokenizers as tok}
								<option value={tok.id}>{tok.name} ({tok.contextWindow} tokens)</option>
							{/each}
						</select>
						<div
							style="margin-top: 0.75rem; padding: 1rem; background-color: {currentTheme.light}; border-radius: 8px; border: 1px solid {currentTheme.primary}30;"
						>
							<div
								style="font-size: 0.8rem; color: {currentTheme.isDark
									? '#9CA3AF'
									: '#6b7280'}; margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase;"
							>
								Model Details
							</div>
							<div
								style="font-size: 0.85rem; color: {currentTheme.dark}; margin-bottom: 0.5rem; font-family: monospace;"
							>
								{currentTokenizer.model}
							</div>
							<div
								style="font-size: 0.85rem; color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
							>
								{currentTokenizer.description}
							</div>
							<div
								style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid {currentTheme.primary}20;"
							>
								<span
									style="font-size: 0.75rem; font-weight: 600; color: {currentTheme.accent}; background-color: {currentTheme.isDark
										? currentTheme.background
										: 'white'}; padding: 0.25rem 0.5rem; border-radius: 4px;"
								>
									Context Window: {currentTokenizer.contextWindow} tokens
								</span>
							</div>
						</div>
					</div>

					<!-- Strategy -->
					<div>
						<label
							style="display: block; margin-bottom: 0.5rem; color: {currentTheme.dark}; font-weight: 600; font-size: 0.95rem;"
							>Chunking Strategy</label
						>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
							{#each strategies as s}
								<button
									on:click={() => (strategy = s.id)}
									style="padding: 0.75rem; border-radius: 8px; border: 2px solid {strategy === s.id
										? currentTheme.primary
										: currentTheme.border}; background-color: {strategy === s.id
										? currentTheme.light
										: currentTheme.isDark
											? currentTheme.background
											: 'white'}; cursor: pointer; text-align: left;"
								>
									<div style="font-weight: 600; color: {currentTheme.dark}; font-size: 0.9rem;">
										{s.name}
									</div>
									<div
										style="font-size: 0.75rem; color: {currentTheme.isDark
											? '#9CA3AF'
											: '#6b7280'}; margin-top: 0.25rem;"
									>
										{s.description}
									</div>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Token Settings -->
				{#if strategy === 'tokens' || strategy === 'hybrid'}
					<div
						style="padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid {currentTheme.border};"
					>
						<div style="margin-bottom: 1.5rem;">
							<div
								style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"
							>
								<label style="color: {currentTheme.dark}; font-weight: 500; font-size: 0.9rem;"
									>Max Tokens per Chunk</label
								>
								<span
									style="font-size: 0.9rem; font-weight: 600; color: {currentTheme.primary}; background-color: {currentTheme.light}; padding: 0.25rem 0.75rem; border-radius: 4px;"
									>{maxTokens}</span
								>
							</div>
							<input
								type="range"
								bind:value={maxTokens}
								min="64"
								max={currentTokenizer.contextWindow}
								step="64"
								style="width: 100%; accent-color: {currentTheme.primary};"
							/>
						</div>
						{#if strategy === 'tokens'}
							<div>
								<div
									style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"
								>
									<label style="color: {currentTheme.dark}; font-weight: 500; font-size: 0.9rem;"
										>Overlap Tokens</label
									>
									<span
										style="font-size: 0.9rem; font-weight: 600; color: {currentTheme.accent}; background-color: {currentTheme.light}; padding: 0.25rem 0.75rem; border-radius: 4px;"
										>{overlap}</span
									>
								</div>
								<input
									type="range"
									bind:value={overlap}
									min="0"
									max={Math.min(128, Math.floor(maxTokens / 2))}
									step="16"
									style="width: 100%; accent-color: {currentTheme.primary};"
								/>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Active Configuration -->
		<div
			style="background-color: {currentTheme.cardBg}; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: {currentTheme.isDark
				? '0 2px 8px rgba(0,0,0,0.4)'
				: '0 2px 8px rgba(0,0,0,0.1)'}; border: 2px solid {currentTheme.border};"
		>
			<div
				style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
			>
				<h4
					style="margin: 0; color: {currentTheme.dark}; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;"
				>
					Active Configuration
				</h4>
				<button
					on:click={() => (showAdvanced = !showAdvanced)}
					style="padding: 0.25rem 0.75rem; background-color: {currentTheme.light}; border: 1px solid {currentTheme.border}; border-radius: 6px; cursor: pointer; font-size: 0.75rem; color: {currentTheme.dark}; font-weight: 500;"
				>
					Modify
				</button>
			</div>
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
				<div>
					<div
						style="font-size: 0.75rem; color: {currentTheme.isDark
							? '#9CA3AF'
							: '#6b7280'}; margin-bottom: 0.25rem;"
					>
						Tokenizer
					</div>
					<div style="font-size: 0.9rem; font-weight: 600; color: {currentTheme.dark};">
						{currentTokenizer.name}
					</div>
					<div
						style="font-size: 0.75rem; color: {currentTheme.isDark
							? '#9CA3AF'
							: '#6b7280'}; font-family: monospace; margin-top: 0.125rem;"
					>
						{currentTokenizer.model}
					</div>
				</div>
				<div>
					<div
						style="font-size: 0.75rem; color: {currentTheme.isDark
							? '#9CA3AF'
							: '#6b7280'}; margin-bottom: 0.25rem;"
					>
						Strategy
					</div>
					<div style="font-size: 0.9rem; font-weight: 600; color: {currentTheme.dark};">
						{strategies.find((s) => s.id === strategy).name}
					</div>
					<div
						style="font-size: 0.75rem; color: {currentTheme.isDark
							? '#9CA3AF'
							: '#6b7280'}; margin-top: 0.125rem;"
					>
						{#if strategy === 'tokens' || strategy === 'hybrid'}
							{maxTokens} tokens/chunk{#if strategy === 'tokens' && overlap > 0}, {overlap} overlap{/if}
						{:else if strategy === 'paragraph'}
							Split on double line breaks
						{:else if strategy === 'sentence'}
							Split on sentence boundaries
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Bar -->
		{#if chunks.length > 0}
			<div
				style="background-color: {currentTheme.cardBg}; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; box-shadow: {currentTheme.isDark
					? '0 2px 8px rgba(0,0,0,0.4)'
					: '0 2px 8px rgba(0,0,0,0.1)'}; border: 2px solid {currentTheme.border}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"
			>
				<div style="display: flex; gap: 2rem; align-items: center;">
					<div>
						<div
							style="font-size: 0.75rem; color: {currentTheme.isDark
								? '#9CA3AF'
								: '#6b7280'}; text-transform: uppercase; font-weight: 600;"
						>
							Total Chunks
						</div>
						<div style="font-size: 1.5rem; font-weight: bold; color: {currentTheme.primary};">
							{chunks.length}
						</div>
					</div>
					<div>
						<div
							style="font-size: 0.75rem; color: {currentTheme.isDark
								? '#9CA3AF'
								: '#6b7280'}; text-transform: uppercase; font-weight: 600;"
						>
							Avg Words/Chunk
						</div>
						<div style="font-size: 1.5rem; font-weight: bold; color: {currentTheme.accent};">
							{Math.round(
								chunks.reduce((sum, c) => sum + c.split(/\s+/).length, 0) / chunks.length
							)}
						</div>
					</div>
				</div>
				<div style="font-size: 0.85rem; color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};">
					Hover over chunks to see details
				</div>
			</div>
		{/if}

		<!-- Main Text Display with Side Panel -->
		<div
			style="background-color: {currentTheme.cardBg}; border-radius: 12px; padding: 1.5rem; box-shadow: {currentTheme.isDark
				? '0 2px 8px rgba(0,0,0,0.4)'
				: '0 2px 8px rgba(0,0,0,0.1)'}; border: 2px solid {currentTheme.border}; min-height: 500px; display: flex; gap: 1.5rem;"
			on:click={(e) => {
				// Close side panel if clicking on the background (not on chunks or side panel)
				if (e.target === e.currentTarget) {
					selectedChunk = null;
				}
			}}
		>
			<!-- Main Content Area -->
			<div
				style="flex: {selectedChunk !== null ? '0 0 65%' : '1'};"
				on:click={(e) => {
					// If clicking in the main content area (not on a chunk), close panel
					if (e.target.closest('span[role="button"]') === null && !isEditing) {
						selectedChunk = null;
					}
				}}
			>
				<div
					style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
				>
					<h3 style="margin: 0; color: {currentTheme.dark};">
						{text === '' ? 'Enter Text' : isEditing ? 'Edit Text' : 'Text with Chunking Overlay'}
					</h3>
					<div style="display: flex; gap: 0.5rem;">
						<button
							on:click={() => (text = sampleText)}
							style="padding: 0.5rem 1rem; background-color: {currentTheme.accent}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;"
						>
							Load Sample
						</button>
						{#if text !== ''}
							<button
								on:click={toggleEditMode}
								style="padding: 0.5rem 1rem; background-color: {currentTheme.primary}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;"
							>
								{isEditing ? 'Done' : 'Edit Text'}
							</button>
						{/if}
					</div>
				</div>

				{#if text === '' || isEditing}
					<div>
						<textarea
							bind:value={text}
							on:blur={handleBlur}
							placeholder="Paste your text here..."
							style="width: 100%; height: 400px; padding: 1rem; border-radius: 8px; border: 2px solid {currentTheme.border}; font-size: 1rem; font-family: inherit; resize: vertical; box-sizing: border-box; line-height: 1.7; background-color: {currentTheme.isDark
								? currentTheme.background
								: 'white'}; color: {currentTheme.dark};"
						></textarea>
						<div
							style="margin-top: 0.75rem; font-size: 0.85rem; color: {currentTheme.isDark
								? '#9CA3AF'
								: '#6b7280'};"
						>
							{#if text === ''}
								Paste text above or click "Load Sample" to get started
							{:else}
								Characters: {text.length} | Words: {text.split(/\s+/).filter((w) => w).length}
							{/if}
						</div>
					</div>
				{:else}
					<div
						style="font-size: 1rem; line-height: 1.8; color: {currentTheme.dark}; white-space: pre-wrap; word-wrap: break-word;"
					>
						{#each chunks as chunk, idx}
							{@const isActive = hoveredChunk === idx || selectedChunk === idx}
							{@const chunkColor = getChunkColor(idx, currentTheme)}
							{@const metadata = getChunkMetadata(chunk, strategy, maxTokens, overlap)}
							{@const qualityColor = getQualityColor(metadata.quality)}

							<span
								role="button"
								tabindex="0"
								on:mouseenter={() => (hoveredChunk = idx)}
								on:mouseleave={() => (hoveredChunk = null)}
								on:click={(e) => {
									e.stopPropagation();
									selectedChunk = idx === selectedChunk ? null : idx;
								}}
								on:keydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										selectedChunk = idx === selectedChunk ? null : idx;
									}
								}}
								style="background-color: {chunkColor.bg}; background-image: {isActive
									? `linear-gradient(90deg, ${chunkColor.border}22 0%, ${chunkColor.border}11 100%)`
									: 'none'}; border-left: {isActive
									? `4px solid ${chunkColor.border}`
									: `2px solid ${chunkColor.border}`}; border-right: {isActive
									? `4px solid ${chunkColor.border}`
									: `2px solid ${chunkColor.border}`}; padding-left: {isActive
									? '0.5rem'
									: '0.25rem'}; padding-right: {isActive
									? '0.5rem'
									: '0.25rem'}; margin-left: {isActive ? '-0.25rem' : '0'}; margin-right: {isActive
									? '-0.25rem'
									: '0'}; border-radius: 4px; transition: all 0.2s ease; cursor: pointer; display: inline-block; position: relative; box-shadow: {isActive
									? currentTheme.isDark
										? '0 2px 8px rgba(0,0,0,0.6)'
										: '0 2px 8px rgba(0,0,0,0.1)'
									: 'none'}; transform: {isActive ? 'scale(1.01)' : 'scale(1)'};"
							>
								<!-- Hover Tooltip -->
								{#if hoveredChunk === idx && selectedChunk !== idx}
									<span
										style="position: absolute; top: -7.5rem; left: 0; font-size: 0.75rem; font-weight: 500; color: {currentTheme.dark}; background-color: {currentTheme.cardBg}; padding: 0.75rem; border-radius: 6px; border: 2px solid {chunkColor.border}; white-space: nowrap; z-index: 10; box-shadow: {currentTheme.isDark
											? '0 4px 12px rgba(0,0,0,0.6)'
											: '0 4px 12px rgba(0,0,0,0.15)'}; min-width: 200px;"
									>
										<div
											style="font-size: 0.7rem; color: {currentTheme.isDark
												? '#9CA3AF'
												: '#6b7280'}; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;"
										>
											Chunk {idx + 1}
										</div>
										<div style="display: flex; flex-direction: column; gap: 0.25rem;">
											<div style="display: flex; justify-content: space-between;">
												<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
													>Tokens:</span
												>
												<span style="font-weight: 600;"
													>{metadata.estimatedTokens}/{maxTokens} ({metadata.utilization}%)</span
												>
											</div>
											<div style="display: flex; justify-content: space-between;">
												<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
													>Words:</span
												>
												<span style="font-weight: 600;">{metadata.words}</span>
											</div>
											<div style="display: flex; justify-content: space-between;">
												<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
													>Sentences:</span
												>
												<span style="font-weight: 600;">{metadata.sentences}</span>
											</div>
											{#if metadata.overlapTokens > 0}
												<div style="display: flex; justify-content: space-between;">
													<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
														>Overlap:</span
													>
													<span style="font-weight: 600;">{metadata.overlapTokens} tokens</span>
												</div>
											{/if}
											<div
												style="display: flex; justify-content: space-between; margin-top: 0.25rem; padding-top: 0.5rem; border-top: 1px solid {currentTheme.border};"
											>
												<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
													>Quality:</span
												>
												<span style="font-weight: 600; color: {qualityColor};"
													>{metadata.quality}</span
												>
											</div>
										</div>
										<div
											style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid {currentTheme.border}; font-size: 0.7rem; color: {currentTheme.isDark
												? '#9CA3AF'
												: '#6b7280'}; text-align: center;"
										>
											Click for details
										</div>
									</span>
								{/if}
								{chunk}
							</span>
							{#if idx < chunks.length - 1}
								<span
									style="display: inline-block; width: 1.5rem; height: 1px; background-color: {currentTheme.primary}; margin: 0 0.5rem; vertical-align: middle; opacity: 0.3;"
								></span>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<!-- Side Detail Panel -->
			{#if selectedChunk !== null && chunks[selectedChunk]}
				{@const selectedChunkColor = getChunkColor(selectedChunk, currentTheme)}
				{@const metadata = getChunkMetadata(chunks[selectedChunk], strategy, maxTokens, overlap)}
				{@const qualityColor = getQualityColor(metadata.quality)}

				<div
					data-side-panel
					style="flex: 0 0 33%; background-color: {selectedChunkColor.bg}; border-radius: 8px; padding: 1.5rem; border: 2px solid {selectedChunkColor.border}; max-height: 600px; overflow-y: auto;"
				>
					<div
						style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
					>
						<h4 style="margin: 0; color: {currentTheme.dark}; font-size: 1.1rem;">
							Chunk {selectedChunk + 1} Details
						</h4>
						<button
							on:click={() => (selectedChunk = null)}
							style="background: none; border: none; color: {currentTheme.dark}; cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 0;"
							>×</button
						>
					</div>

					<div style="display: flex; flex-direction: column; gap: 1.5rem;">
						<!-- Statistics -->
						<div>
							<h5
								style="margin: 0 0 0.75rem 0; color: {currentTheme.isDark
									? '#9CA3AF'
									: '#6b7280'}; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;"
							>
								Statistics
							</h5>
							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								{#each [['Tokens', `${metadata.estimatedTokens}/${maxTokens}`], ['Utilization', `${metadata.utilization}%`], ['Words', metadata.words], ['Characters', metadata.chars], ['Sentences', metadata.sentences], ['Tokens/Word', (metadata.estimatedTokens / metadata.words).toFixed(2)]] as [label, value]}
									<div
										style="display: flex; justify-content: space-between; padding: 0.5rem; background-color: {currentTheme.cardBg}; border-radius: 4px;"
									>
										<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
											>{label}</span
										>
										<span style="font-weight: 600; color: {currentTheme.dark};">{value}</span>
									</div>
								{/each}
							</div>
						</div>

						<!-- Overlap -->
						{#if metadata.overlapTokens > 0}
							<div>
								<h5
									style="margin: 0 0 0.75rem 0; color: {currentTheme.isDark
										? '#9CA3AF'
										: '#6b7280'}; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;"
								>
									Overlap
								</h5>
								<div
									style="padding: 0.75rem; background-color: {currentTheme.cardBg}; border-radius: 4px;"
								>
									<div
										style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"
									>
										<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
											>With previous</span
										>
										<span style="font-weight: 600; color: {currentTheme.dark};"
											>{metadata.overlapTokens} tokens</span
										>
									</div>
									<div style="display: flex; justify-content: space-between;">
										<span style="color: {currentTheme.isDark ? '#9CA3AF' : '#6b7280'};"
											>Percentage</span
										>
										<span style="font-weight: 600; color: {currentTheme.dark};"
											>{Math.round(
												(metadata.overlapTokens / metadata.estimatedTokens) * 100
											)}%</span
										>
									</div>
								</div>
							</div>
						{/if}

						<!-- Quality Assessment -->
						<div>
							<h5
								style="margin: 0 0 0.75rem 0; color: {currentTheme.isDark
									? '#9CA3AF'
									: '#6b7280'}; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;"
							>
								Quality Assessment
							</h5>
							<div
								style="padding: 0.75rem; background-color: {currentTheme.cardBg}; border-radius: 4px;"
							>
								<div
									style="display: inline-block; padding: 0.5rem 1rem; background-color: {qualityColor}20; color: {qualityColor}; border-radius: 6px; font-weight: 600; font-size: 1rem;"
								>
									{metadata.quality}
								</div>
								<div
									style="margin-top: 0.75rem; font-size: 0.85rem; color: {currentTheme.isDark
										? '#9CA3AF'
										: '#6b7280'}; line-height: 1.5;"
								>
									{#if metadata.quality === 'Excellent'}
										Optimal token utilization with clean sentence boundaries.
									{:else if metadata.quality === 'Good'}
										Acceptable chunking with reasonable token usage.
									{:else if metadata.quality === 'Warning'}
										Chunk splits mid-sentence. Consider adjusting strategy.
									{:else if metadata.quality === 'Low'}
										Low context utilization. Consider smaller chunk size.
									{/if}
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div>
							<h5
								style="margin: 0 0 0.75rem 0; color: {currentTheme.isDark
									? '#9CA3AF'
									: '#6b7280'}; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;"
							>
								Actions
							</h5>
							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								<button
									on:click={() => copyToClipboard(chunks[selectedChunk])}
									style="padding: 0.75rem; background-color: {currentTheme.accent}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;"
								>
									Copy Text
								</button>
								<button
									on:click={() => {
										const data = {
											chunk_id: selectedChunk,
											text: chunks[selectedChunk],
											metadata: metadata
										};
										copyToClipboard(JSON.stringify(data, null, 2));
									}}
									style="padding: 0.75rem; background-color: {currentTheme.primary}; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;"
								>
									Copy as JSON
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
