<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import { cueY } from '#lib/components/scroll-cue/cue.ts';
	import { COPY } from '#lib/copy.ts';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import type { TagCount, Tree } from '#lib/types.ts';
	import { newNote } from './capture.ts';
	import { readCollapsed, writeCollapsed } from './sidebar.ts';
	import TagList from './TagList.svelte';
	import FocusTree from './tree/FocusTree.svelte';
	import Icon from './tree/Icon.svelte';

	const tree = $derived(page.data.tree as Tree);
	const tags = $derived(page.data.tags as TagCount[]);

	// the rail itself is driven by html[data-rail] (set before paint by RAIL_SCRIPT); this only labels the toggle
	let folded = $state(false);

	onMount(() => {
		folded = document.documentElement.hasAttribute('data-rail');
	});

	function toggle() {
		folded = !folded;
		document.documentElement.toggleAttribute('data-rail', folded);
		writeCollapsed(folded);
	}

	const home = $derived(page.url.pathname === '/');
	const search = $derived(page.url.pathname === '/search');
</script>

<nav class="side" aria-label="Sidebar" data-sidebar>
	<div class="top">
		<a class="brand" href="/"><span class="brand-mark" aria-hidden="true">N</span><span class="brand-name">Notes Archive</span></a>
		<Button variant="quiet" size="xs" icon label={folded ? COPY.unfoldSidebar : COPY.foldSidebar} aria-expanded={!folded} onclick={toggle}><Icon name="sidebar" /></Button>
	</div>

	<ul class="actions">
		<li>
			<a class="act" href="/" data-press aria-current={home ? 'page' : undefined}><span class="disc"><Icon name="home" size={16} /></span><span class="t">Home</span></a>
		</li>
		<li>
			<button type="button" class="act" data-press aria-current={search ? 'page' : undefined} aria-keyshortcuts="Control+K Meta+K" onclick={openPalette}><span class="disc"><Icon name="search" size={16} /></span><span class="t">Search</span><kbd aria-hidden="true">Ctrl K</kbd></button>
		</li>
		<li>
			<button type="button" class="act primary" data-press onclick={() => newNote()}><span class="disc"><Icon name="plus" size={16} /></span><span class="t">{COPY.newNote}</span></button>
		</li>
	</ul>

	<FocusTree {tree} />

	{#if tags.length}
		<div class="tagbox" use:cueY><TagList {tags} /></div>
	{/if}
</nav>

<style>
	/* sticky in the frame's first column: it stays in view while the page scrolls past it */
	.side {
		position: sticky;
		z-index: var(--z-raised);
		inset-block-start: var(--space-3-5);
		block-size: calc(100dvh - 2 * var(--space-frame-block) - 2 * var(--space-3-5));
		min-block-size: 30rem;
		display: none;
		flex-direction: column;
		gap: var(--space-4);
		inline-size: var(--sidebar-w);
		min-block-size: 0;
		padding: var(--space-3-5) var(--space-2-5) var(--space-4);
		border-radius: var(--radius-card);
		background: var(--surface-glass);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-rim);
	}
	@media (min-width: 1024px) {
		.side {
			display: flex;
		}
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding-inline-start: var(--space-1);
	}
	.top .brand {
		min-inline-size: 0;
	}
	.top .brand-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.actions {
		display: grid;
		gap: var(--space-0-5);
		padding: var(--space-1);
		border-radius: var(--radius-bar-compact);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
	}
	.act {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding: 0 var(--space-3-5) 0 var(--space-1);
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--ink);
		text-align: start;
		text-decoration: none;
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.disc {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-9);
		block-size: var(--space-9);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.act[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-weight: var(--weight-semibold);
	}
	.act[aria-current] .disc {
		color: var(--ink);
	}
	.act[aria-current] kbd {
		color: var(--ink-on-inverse-secondary);
		box-shadow: var(--ring-on-inverse);
	}
	.act[aria-current]:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	/* the screen's arrow pill is the one dark primary; New note here is a quiet row with a dark disc */
	.act.primary .disc {
		box-shadow: none;
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.act kbd {
		margin-inline-start: auto;
		padding: var(--space-0-5) var(--space-2);
		border-radius: var(--radius-pill);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
		font-family: var(--font-ui);
		font-size: var(--type-caption-size);
		white-space: nowrap;
	}
	.tagbox {
		flex: 0 1 auto;
		min-block-size: 0;
		max-block-size: 10rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	@media (hover: hover) {
		.act:not([aria-current]):hover {
			background: var(--surface-hover);
		}
	}

	/* the folded sidebar: a narrow capsule with the three actions; labels stay as accessible names */
	:global(html[data-rail]) .side {
		inline-size: var(--rail-w);
		block-size: fit-content;
		min-block-size: 0;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		border-radius: var(--radius-pill);
	}
	:global(html[data-rail]) .brand,
	:global(html[data-rail]) .side :global(.folders),
	:global(html[data-rail]) .tagbox {
		display: none;
	}
	:global(html[data-rail]) .top {
		padding: 0;
	}
	:global(html[data-rail]) .actions {
		border-radius: var(--radius-pill);
	}
	:global(html[data-rail]) .act {
		justify-content: center;
		padding: 0;
		min-inline-size: var(--space-9);
	}
	:global(html[data-rail]) .act[aria-current] {
		background: var(--surface-tint-strong);
		color: var(--ink);
	}
	:global(html[data-rail]) .t,
	:global(html[data-rail]) kbd {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
