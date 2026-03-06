<script>
	import { settings } from '$lib/stores/settings.svelte.js';
	import { apiKey } from '$lib/stores/apikey.svelte.js';
	import { EMBEDDING_MODELS } from '$lib/utils/embeddings.js';

	let showKey = $state(false);
	let currentModel = $derived(EMBEDDING_MODELS.find((m) => m.id === settings.embedding.model));

	function handleModelChange(id) {
		settings.embedding.model = id;
		const model = EMBEDDING_MODELS.find((m) => m.id === id);
		if (model && !model.supportsDimensionReduction) {
			settings.embedding.dimensions = null;
		}
	}
</script>

<!-- Embedding model -->
<div class="field">
	<label for="embedding-model" class="label">Embedding Model</label>
	<select
		id="embedding-model"
		value={settings.embedding.model}
		onchange={(e) => handleModelChange(e.target.value)}
		class="select"
	>
		{#each EMBEDDING_MODELS as model (model.id)}
			<option value={model.id}>{model.name}</option>
		{/each}
	</select>
	{#if currentModel}
		<div class="model-detail">
			<span class="model-dims">{currentModel.defaultDimensions} dimensions</span>
			{#if currentModel.supportsDimensionReduction}
				<span class="model-feature">Supports dimension reduction</span>
			{/if}
		</div>
	{/if}
</div>

<!-- Dimensions -->
{#if currentModel?.supportsDimensionReduction}
	<div class="field">
		<label for="embedding-dims" class="label">Dimensions</label>
		<input
			id="embedding-dims"
			type="number"
			value={settings.embedding.dimensions ?? ''}
			placeholder={currentModel.defaultDimensions}
			min={1}
			max={currentModel.defaultDimensions}
			onchange={(e) => {
				const val = e.target.value ? parseInt(e.target.value, 10) : null;
				settings.embedding.dimensions = val;
			}}
			class="input"
		/>
		<span class="hint">Leave empty for default ({currentModel.defaultDimensions})</span>
	</div>
{/if}

<!-- API Key -->
<div class="field">
	<label for="api-key" class="label">OpenAI API Key</label>
	<div class="key-input-wrap">
		<input
			id="api-key"
			type={showKey ? 'text' : 'password'}
			value={apiKey.value}
			oninput={(e) => (apiKey.value = e.target.value)}
			placeholder="sk-..."
			class="input key-input"
			autocomplete="off"
		/>
		<button class="key-toggle" onclick={() => (showKey = !showKey)} type="button">
			{showKey ? 'Hide' : 'Show'}
		</button>
	</div>
	<span class="hint">Stored locally in your browser. Never sent to our servers.</span>
</div>

<style>
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

	.input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		font-size: var(--font-size-sm);
		background-color: white;
		color: var(--color-dark);
		font-weight: 500;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.model-detail {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.model-dims {
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.model-feature {
		font-size: var(--font-size-xs);
		color: var(--color-success);
		font-weight: 500;
	}

	.key-input-wrap {
		display: flex;
		gap: var(--space-xs);
	}

	.key-input {
		flex: 1;
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
	}

	.key-toggle {
		padding: var(--space-sm) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: white;
		color: var(--color-muted);
		font-size: var(--font-size-xs);
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--transition-fast);
	}

	.key-toggle:hover {
		border-color: var(--color-dark);
		color: var(--color-dark);
	}

	.hint {
		font-size: var(--font-size-xs);
		color: var(--color-muted);
		font-style: italic;
	}
</style>
