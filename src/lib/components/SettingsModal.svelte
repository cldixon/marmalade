<script>
	import SettingsSection from './SettingsSection.svelte';
	import EmbeddingSettings from './settings/EmbeddingSettings.svelte';

	/**
	 * @type {{ open: boolean, onclose: () => void }}
	 */
	let { open, onclose } = $props();

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKeydown(e) {
		if (open && e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_interactive_supports_focus -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label="Settings"
	>
		<div class="modal-card">
			<div class="modal-header">
				<h2 class="modal-title">Settings</h2>
				<button class="modal-close" onclick={onclose} aria-label="Close settings">&times;</button>
			</div>
			<div class="modal-body">
				<SettingsSection title="Embeddings" expanded={true}>
					<EmbeddingSettings />
				</SettingsSection>
			</div>
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
		max-width: 480px;
		max-height: 80vh;
		overflow-y: auto;
		padding: var(--space-lg);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.modal-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-dark);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.4rem;
		cursor: pointer;
		color: var(--color-muted);
		line-height: 1;
		padding: 0;
		transition: color var(--transition-fast);
	}

	.modal-close:hover {
		color: var(--color-dark);
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}
</style>
