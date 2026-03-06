<script>
	import { VERSION } from '$lib/version.js';

	/**
	 * @type {{ onopenSettings?: () => void }}
	 */
	let { onopenSettings } = $props();
</script>

<header class="header">
	<div class="header-inner">
		<div class="header-left">
			<h1 class="header-title">🫙 Marmalade</h1>
			<p class="header-subtitle">Visualize your text chunks</p>
		</div>
		<div class="header-right">
			<span class="header-version">v{VERSION}</span>
			{#if onopenSettings}
				<button class="gear-btn" onclick={onopenSettings} title="Settings">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
</header>

<style>
	.header {
		background-color: var(--color-primary);
		color: white;
		padding: var(--space-md) var(--space-xl);
		box-shadow: var(--shadow-md);
	}

	.header-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		flex-direction: column;
	}

	.header-title {
		margin: 0;
		font-size: var(--font-size-xl);
		font-weight: bold;
	}

	.header-subtitle {
		margin: var(--space-xs) 0 0 0;
		opacity: 0.9;
		font-size: var(--font-size-sm);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.header-version {
		opacity: 0.9;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: var(--font-mono);
	}

	.gear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background: rgba(255, 255, 255, 0.15);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		color: white;
		transition: background-color var(--transition-fast);
	}

	.gear-btn:hover {
		background: rgba(255, 255, 255, 0.25);
	}
</style>
