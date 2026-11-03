<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import CommandPalette from '#lib/search/CommandPalette.svelte';
	import BottomBar from '#lib/shell/BottomBar.svelte';
	import Drawer from '#lib/shell/Drawer.svelte';
	import { pageTransition } from '#lib/shell/morph.ts';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import { RAIL_SCRIPT } from '#lib/shell/sidebar.ts';
	import TagsSection from '#lib/shell/TagsSection.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	let drawerOpen = $state(false);

	onNavigate(pageTransition);
</script>

<svelte:head>{@html `<script>${RAIL_SCRIPT}</script>`}</svelte:head>

{#snippet tags()}
	<TagsSection tags={data.tags} />
{/snippet}

<Sidebar tree={data.tree} {tags} />
<main class="area">
	<div class="page">
		{@render children()}
	</div>
</main>
<BottomBar foldersOpen={drawerOpen} onfolders={() => (drawerOpen = true)} />
<Drawer open={drawerOpen} tree={data.tree} {tags} onclose={() => (drawerOpen = false)} />
<CommandPalette />

<style>
	.area {
		padding: var(--s-6) var(--gutter) calc(var(--s-11) + var(--s-6) + env(safe-area-inset-bottom));
	}

	.page {
		max-inline-size: 1400px;
		margin-inline: auto;
	}

	@media (min-width: 1024px) {
		.area {
			padding-inline-start: calc(var(--sidebar-w) + var(--s-4) + var(--gutter));
			padding-block: var(--s-7) var(--s-10);
		}

		:global(html[data-rail]) .area {
			padding-inline-start: calc(var(--rail-w) + var(--s-4) + var(--gutter));
		}
	}

	/* the root crossfade is the default; this adds the 8 px slide, and reduced motion keeps only a short fade */
	:global(::view-transition-old(root)) {
		animation: var(--d-fast) var(--ease-out) both vt-out;
	}

	:global(::view-transition-new(root)) {
		animation: var(--d-base) var(--ease-out) both vt-in;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-group(root)) {
			animation: none;
		}

		:global(::view-transition-old(root)) {
			animation: 120ms linear both vt-out;
		}

		:global(::view-transition-new(root)) {
			animation: 120ms linear both vt-in-fade;
		}
	}

	@keyframes -global-vt-out {
		to {
			opacity: 0;
		}
	}

	@keyframes -global-vt-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}

	@keyframes -global-vt-in-fade {
		from {
			opacity: 0;
		}
	}
</style>
