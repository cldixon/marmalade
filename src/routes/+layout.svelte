<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>Marmalade - Text Chunking Visualizer</title>
	<meta
		name="description"
		content="Visualize how text is tokenized and chunked for embeddings and retrieval. A developer tool for understanding text chunking strategies."
	/>

	<!-- Open Graph / Social Media -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Marmalade - Text Chunking Visualizer" />
	<meta
		property="og:description"
		content="Visualize how text is tokenized and chunked for embeddings and retrieval."
	/>

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Marmalade - Text Chunking Visualizer" />
	<meta
		name="twitter:description"
		content="Visualize how text is tokenized and chunked for embeddings and retrieval."
	/>

	<!-- Favicon -->
	<link
		rel="icon"
		href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🫙</text></svg>"
	/>
</svelte:head>

{@render children?.()}
