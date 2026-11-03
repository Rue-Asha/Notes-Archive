<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import FolderTree from '#lib/folders/FolderTree.svelte';
	import { COPY } from '#lib/copy.ts';
	import { newNote } from '#lib/notes/api.ts';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import type { Tree } from '#lib/types.ts';
	import { readCollapsed, writeCollapsed } from './sidebar.ts';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { tree, tags }: { tree: Tree; tags?: Snippet } = $props();

	// the rail itself is driven by html[data-rail] (set before paint by RAIL_SCRIPT); this only labels the toggle
	let collapsed = $state(false);

	onMount(() => {
		collapsed = document.documentElement.hasAttribute('data-rail');
	});

	function toggle() {
		collapsed = !collapsed;
		document.documentElement.toggleAttribute('data-rail', collapsed);
		writeCollapsed(collapsed);
	}
</script>

<GlassPanel as="nav" class="sidebar" data-sidebar aria-label="Sidebar">
	<div class="head">
		<a class="brand" href="/"><span class="mark" aria-hidden="true">n</span><span class="wordmark label">Notes</span></a>
		<button class="collapse" type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onclick={toggle}>
			<Icon name="sidebar" size={18} />
		</button>
	</div>

	<div class="nav">
		<a class="item" class:active={page.url.pathname === '/'} href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>
			<Icon name="home" size={19} /><span class="label">Home</span>
		</a>
		<button class="item" type="button" onclick={openPalette}><Icon name="search" size={19} /><span class="label">Search</span><kbd>⌘K</kbd></button>
		<button class="item" type="button" onclick={() => newNote()}><Icon name="plus" size={19} /><span class="label">{COPY.newNote}</span></button>
	</div>

	<div class="scroll">
		<section>
			<h2 class="eyebrow section-head">Folders</h2>
			<FolderTree {tree} />
		</section>
		{@render tags?.()}
	</div>
</GlassPanel>

<style>
	:global(.sidebar) {
		position: fixed;
		z-index: 20;
		inset-block: var(--s-4);
		inset-inline-start: var(--s-4);
		display: none;
		flex-direction: column;
		inline-size: var(--sidebar-w);
		padding: var(--s-4) var(--s-3);
		gap: var(--s-4);
	}

	@media (min-width: 1024px) {
		:global(.sidebar) {
			display: flex;
		}
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--s-2) var(--s-1);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
	}

	.mark {
		display: grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--r-pill);
		background: var(--ink);
		color: var(--surface);
		font-family: var(--font-display);
		font-size: 19px;
		font-style: italic;
		font-weight: 500;
		line-height: 1;
		padding-block-end: 3px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 420;
		letter-spacing: -0.015em;
	}

	.collapse {
		display: inline-grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
	}

	.collapse:hover {
		background: var(--row-hover);
	}

	.nav {
		display: grid;
		gap: var(--s-1);
	}

	.item {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-block-size: 40px;
		padding-inline: var(--s-3);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-weight: 500;
		text-align: start;
	}

	.item:hover:not(.active) {
		background: var(--row-hover);
	}

	.item.active {
		background: var(--ink);
		color: var(--surface);
	}

	kbd {
		margin-inline-start: auto;
		font: inherit;
		font-size: var(--t-small);
		letter-spacing: 0.04em;
		color: var(--ink-2);
	}

	.scroll {
		display: grid;
		flex: 1;
		align-content: start;
		gap: var(--s-5);
		min-block-size: 0;
		margin-inline: calc(var(--s-1) * -1);
		padding-inline: var(--s-1);
		overflow-y: auto;
	}

	.section-head {
		padding-inline: var(--s-2) var(--s-1);
		margin-block-end: var(--s-1);
		font-family: var(--font-text);
	}

	:global(html[data-rail] .sidebar) {
		inline-size: var(--rail-w);
	}

	:global(html[data-rail]) .head {
		flex-direction: column;
		gap: var(--s-3);
		padding-inline: 0;
	}

	:global(html[data-rail]) .item {
		justify-content: center;
		padding-inline: 0;
	}

	:global(html[data-rail]) .label,
	:global(html[data-rail]) kbd {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		white-space: nowrap;
	}

	:global(html[data-rail]) .scroll {
		display: none;
	}
</style>
