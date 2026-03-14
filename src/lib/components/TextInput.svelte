<script>
	import { getRandomSample } from '$lib/data/samples.js';

	/**
	 * @type {{
	 *   text: string,
	 *   isEditing: boolean,
	 *   onchange: (text: string) => void,
	 *   ontoggleedit: () => void,
	 *   headerMode?: boolean
	 * }}
	 */
	let { text, isEditing, onchange, ontoggleedit, headerMode = false } = $props();

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

{#if headerMode}
	<!-- Render just the action buttons (for embedding in a content header) -->
	<div class="header-actions">
		<button class="btn btn--accent" onclick={loadSample}>Load Sample</button>
		{#if text !== ''}
			<button class="btn btn--primary" onclick={ontoggleedit}>
				{isEditing ? 'Done' : 'Edit'}
			</button>
		{/if}
	</div>
{:else}
	<!-- Render the textarea area -->
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
{/if}

<style>
	.header-actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 7px 14px;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-family: var(--font-base);
		font-size: 12px;
		font-weight: 600;
		color: white;
		line-height: 16px;
		transition: opacity var(--transition-fast);
		white-space: nowrap;
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
		font-family: var(--font-base);
		font-size: 14px;
		resize: vertical;
		box-sizing: border-box;
		line-height: 24px;
		color: var(--color-dark);
		background-color: white;
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.text-meta {
		margin-top: var(--space-sm);
		font-size: 10px;
		color: var(--color-muted-warm);
	}
</style>
