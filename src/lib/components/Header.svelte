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
			<span class="header-title">Marmalade</span>
			<span class="header-subtitle">Visualize your text chunks</span>
		</div>
		<div class="header-right">
			<span class="header-version">v{VERSION}</span>
			{#if onopenSettings}
				<button class="gear-btn" onclick={onopenSettings} title="Settings">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
		background-color: var(--color-light);
		border-bottom: 1px solid var(--color-border);
		padding: 20px 48px;
	}

	.header-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.header-title {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--color-primary);
		line-height: 34px;
	}

	.header-subtitle {
		font-family: var(--font-base);
		font-size: 14px;
		font-weight: 400;
		color: var(--color-subtitle);
		line-height: 18px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.header-version {
		font-family: var(--font-base);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted-warm);
	}

	.gear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		color: var(--color-muted-warm);
		transition: all var(--transition-fast);
	}

	.gear-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
</style>
