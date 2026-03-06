<script>
	import { getRandomSample } from '$lib/data/samples.js';

	/**
	 * @type {{
	 *   text: string,
	 *   isEditing: boolean,
	 *   onchange: (text: string) => void,
	 *   ontoggleedit: () => void
	 * }}
	 */
	let { text, isEditing, onchange, ontoggleedit } = $props();

	function handleBlur() {
		setTimeout(() => {
			if (isEditing && text !== '') {
				ontoggleedit();
			}
		}, 100);
	}

	function loadSample() {
		onchange(getRandomSample().text);
	}
</script>

<div class="text-input-header">
	<h3 class="text-input-title">
		{text === '' ? 'Enter Text' : isEditing ? 'Edit Text' : 'Text'}
	</h3>
	<div class="text-input-actions">
		<button class="btn btn--accent" onclick={loadSample}>Load Sample</button>
		{#if text !== ''}
			<button class="btn btn--primary" onclick={ontoggleedit}>
				{isEditing ? 'Done' : 'Edit'}
			</button>
		{/if}
	</div>
</div>

{#if text === '' || isEditing}
	<div>
		<textarea
			value={text}
			oninput={(e) => onchange(e.target.value)}
			onblur={handleBlur}
			placeholder="Paste your text here..."
			class="textarea"
		></textarea>
		<div class="text-meta">
			{#if text === ''}
				Paste text above or click "Load Sample" to get started
			{:else}
				{text.length} characters · {text.split(/\s+/).filter((w) => w).length} words
			{/if}
		</div>
	</div>
{/if}

<style>
	.text-input-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.text-input-title {
		margin: 0;
		color: var(--color-dark);
		font-size: var(--font-size-base);
	}

	.text-input-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.btn {
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: white;
		transition: opacity var(--transition-fast);
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn--primary {
		background-color: var(--color-primary);
	}

	.btn--accent {
		background-color: var(--color-accent);
	}

	.textarea {
		width: 100%;
		height: 400px;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		font-size: var(--font-size-base);
		font-family: var(--font-base);
		resize: vertical;
		box-sizing: border-box;
		line-height: 1.7;
		color: var(--color-dark);
		background-color: white;
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.text-meta {
		margin-top: var(--space-sm);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}
</style>
