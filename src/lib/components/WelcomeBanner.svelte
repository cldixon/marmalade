<script>
	import { onMount } from 'svelte';

	/** @type {{ ondismiss?: () => void }} */
	let { ondismiss } = $props();

	let visible = $state(false);

	onMount(() => {
		visible = !localStorage.getItem('marmalade_welcomed');
	});

	function dismiss() {
		visible = false;
		localStorage.setItem('marmalade_welcomed', 'true');
		ondismiss?.();
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) dismiss();
	}

	function handleKeydown(e) {
		if (visible && e.key === 'Escape') dismiss();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label="Welcome to Marmalade"
	>
		<div class="modal-card">
			<button class="modal-close" onclick={dismiss} aria-label="Dismiss welcome">&times;</button>
			<h2 class="modal-title">Welcome to Marmalade</h2>
			<p class="modal-text">
				You're seeing how text gets chunked for embedding models. Paste your own to try it.
			</p>
			<button class="modal-action" onclick={dismiss}>Got it</button>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: var(--color-backdrop);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal-card {
		background: var(--color-card);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		width: 90%;
		max-width: 400px;
		padding: var(--space-lg);
		text-align: center;
		position: relative;
	}

	.modal-close {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		background: none;
		border: none;
		font-size: 1.4rem;
		cursor: pointer;
		color: var(--color-muted-warm);
		line-height: 1;
		padding: 0;
		transition: color var(--transition-fast);
	}

	.modal-close:hover {
		color: var(--color-dark);
	}

	.modal-title {
		margin: 0 0 var(--space-sm);
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
		color: var(--color-dark);
	}

	.modal-text {
		margin: 0 0 var(--space-md);
		font-family: var(--font-base);
		font-size: 13px;
		color: var(--color-subtitle);
		line-height: 1.5;
	}

	.modal-action {
		font-family: var(--font-base);
		font-size: 13px;
		font-weight: 600;
		color: white;
		background-color: var(--color-primary);
		border: none;
		border-radius: var(--radius-md);
		padding: 8px 24px;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.modal-action:hover {
		opacity: 0.9;
	}
</style>
