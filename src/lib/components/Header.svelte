<script>
	import { VERSION } from '$lib/version.js';
</script>

<header class="header">
	<div class="header-inner">
		<div>
			<h1 class="header-title">🫙 Marmalade</h1>
			<p class="header-subtitle">Visualize your text chunks</p>
		</div>
		<div class="header-version">v{VERSION}</div>
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

	.header-version {
		opacity: 0.9;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: var(--font-mono);
	}
</style>
