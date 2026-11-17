<script lang="ts">
	import '#lib/styles/fingerprint/tokens.css';
	import '#lib/styles/fingerprint/fonts.css';
	import '#lib/styles/fingerprint/base.css';
	import '#lib/styles/fingerprint/motion.css';
	import '#lib/styles/fingerprint/layout.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// the server stamps the old look on <html>; this lands before first paint and again once hydrated
	$effect(() => {
		document.documentElement.dataset.accent = 'slate';
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	{@html '<script>document.documentElement.dataset.accent="slate"</script>'}
</svelte:head>

{@render children()}
