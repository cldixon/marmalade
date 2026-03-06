<script>
	import { onMount } from 'svelte';

	let dismissed = $state(true);

	onMount(() => {
		dismissed = localStorage.getItem('marmalade-privacy-dismissed') === 'true';
	});

	function dismiss() {
		dismissed = true;
		localStorage.setItem('marmalade-privacy-dismissed', 'true');
	}
</script>

{#if !dismissed}
	<div class="privacy-notice">
		<span class="privacy-text">
			🔒 All tokenization happens in your browser. Your text never leaves your device.
		</span>
		<button class="privacy-dismiss" onclick={dismiss} aria-label="Dismiss notice">×</button>
	</div>
{/if}

<style>
	.privacy-notice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-light);
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-xs);
		color: var(--color-muted);
	}

	.privacy-text {
		text-align: center;
	}

	.privacy-dismiss {
		background: none;
		border: none;
		color: var(--color-muted);
		cursor: pointer;
		font-size: var(--font-size-base);
		padding: 0 var(--space-xs);
		line-height: 1;
	}

	.privacy-dismiss:hover {
		color: var(--color-dark);
	}
</style>
