<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Icon from './Icon.svelte';
	import SortMenu from './SortMenu.svelte';
	import TreeBranch from './TreeBranch.svelte';
	import type { MockTag, TreeSort } from '../../fixtures.ts';
	import { link, plural, type TreeView } from './data.ts';

	type Props = {
		view: TreeView;
		tags: MockTag[];
		sort: TreeSort;
		worst: boolean;
		rail?: boolean;
		current?: 'home' | 'folders' | 'search' | null;
		menuOpen?: boolean;
		moreOpen?: boolean;
	};
	let { view, tags, sort, worst, rail = $bindable(false), current = null, menuOpen = false, moreOpen = false }: Props = $props();

	// a screen mounts its own shell, so the props only seed the state
	/* svelte-ignore state_referenced_locally */
	const open = new SvelteSet<number>(view.open);
	const toggle = (id: number) => (open.has(id) ? open.delete(id) : open.add(id));

	/* svelte-ignore state_referenced_locally */
	/* svelte-ignore state_referenced_locally */
	let more = $state(moreOpen);
	const HIDE_FROM = 10;
	const shortened = $derived(view.path.length >= HIDE_FROM && !more);
	const crumbs = $derived(shortened ? [view.path[0], ...view.path.slice(-2)] : view.path);
</script>

{#if rail}
	<nav class="side rail" aria-label="Sidebar">
		<button type="button" class="icon" aria-label="Unfold sidebar" aria-expanded="false" onclick={() => (rail = false)}><Icon name="sidebar" /></button>
		<ul>
			<li><a class="icon" href={link('home', worst)} aria-label="Home" aria-current={current === 'home' ? 'page' : undefined}><Icon name="home" /></a></li>
			<li><button type="button" class="icon" aria-label="Search"><Icon name="search" /></button></li>
			<li><button type="button" class="icon" aria-label="New note"><Icon name="plus" /></button></li>
		</ul>
	</nav>
{:else}
	<nav class="side" aria-label="Sidebar">
		<div class="top">
			<a class="brand" href={link('home', worst)}><span class="brand-mark" aria-hidden="true">N</span><span class="brand-name">Notes Archive</span></a>
			<button type="button" class="icon" aria-label="Fold sidebar" aria-expanded="true" onclick={() => (rail = true)}><Icon name="sidebar" /></button>
		</div>

		<ul class="quick">
			<li><a href={link('home', worst)} aria-current={current === 'home' ? 'page' : undefined}><Icon name="home" /><span>Home</span></a></li>
			<li><button type="button"><Icon name="search" /><span>Search</span><kbd>Ctrl K</kbd></button></li>
			<li><button type="button"><Icon name="plus" /><span>New note</span></button></li>
		</ul>

		<section class="folders" aria-labelledby="side-folders">
			<div class="head">
				<h2 id="side-folders">Folders</h2>
				<div class="tools">
					<button type="button" class="icon small" aria-label="New folder"><Icon name="folderPlus" size={16} /></button>
					<SortMenu mode={sort} open={menuOpen} />
				</div>
			</div>

			<div class="scroll">
				{#if view.focus}
					<ol class="path" aria-label="Path" data-open={more || undefined}>
						<li><a href={link('folders', worst)}>Folders</a></li>
						{#if shortened}
							<li><a href={link('folder', worst)} title={crumbs[0].name}>{crumbs[0].name}</a></li>
							<li><button type="button" class="more" aria-label="Show all {view.path.length} parent folders" aria-expanded="false" onclick={() => (more = true)}>…</button></li>
							{#each crumbs.slice(1) as c (c.id)}
								<li><a href={link('folder', worst)} title={c.name}>{c.name}</a></li>
							{/each}
						{:else}
							{#each view.path as c (c.id)}
								<li><a href={link('folder', worst)} title={c.name}>{c.name}</a></li>
							{/each}
							{#if more}
								<li class="fold"><button type="button" class="more" aria-expanded="true" onclick={() => (more = false)}>Shorten path</button></li>
							{/if}
						{/if}
					</ol>
					<p class="focus" title={view.focus.name}><Icon name="folder" size={16} /><span>{view.focus.name}</span></p>
				{/if}

				{#if view.empty}
					<div class="empty">
						<p>No folders yet</p>
						<button type="button" class="outline"><Icon name="folderPlus" size={16} />New folder</button>
					</div>
				{:else}
					<div class="tree" data-focused={view.focus ? '' : undefined}>
						<TreeBranch nodes={view.nodes} notes={view.notes} current={view.current} {open} {worst} {toggle} />
					</div>
				{/if}
			</div>
		</section>

		{#if tags.length}
			<section class="tags" aria-labelledby="side-tags">
				<div class="head"><h2 id="side-tags">Tags</h2><span class="n">{tags.length.toLocaleString('en')}</span></div>
				<ul>
					{#each tags as tag (tag.id)}
						<li>
							<a href={link('tag', worst)} title="{tag.name} · {plural(tag.count, 'note')}"><Icon name="tag" size={14} /><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en')}</span></a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</nav>
{/if}

<style>
	.side {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		block-size: 100%;
		min-block-size: 0;
		min-inline-size: 0;
		padding: var(--space-3);
		border: var(--stroke-hairline) solid var(--hairline);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
	}
	.side.rail {
		align-items: center;
		inline-size: var(--rail-width);
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
	}
	.rail ul {
		display: grid;
		gap: var(--space-1);
		padding-block-start: var(--space-3);
		border-block-start: var(--stroke-hairline) solid var(--hairline);
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}
	.top .brand {
		min-inline-size: 0;
	}
	.top .brand-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.icon {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--target), 36px);
		block-size: max(var(--target), 36px);
		padding: 0;
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: var(--ink);
		text-decoration: none;
	}
	.icon.small {
		inline-size: max(var(--target), 30px);
		block-size: max(var(--target), 30px);
		color: var(--ink-secondary);
	}
	a.icon[aria-current] {
		background: var(--surface-tint-strong);
	}
	.quick {
		display: grid;
		gap: var(--space-0-5);
	}
	.quick a,
	.quick button {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		inline-size: 100%;
		min-block-size: max(var(--target), 36px);
		padding: 0 var(--space-2);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: var(--ink);
		text-align: start;
		text-decoration: none;
		font-weight: var(--weight-medium);
	}
	.quick a[aria-current] {
		background: var(--surface-tint-strong);
	}
	.quick kbd {
		margin-inline-start: auto;
		color: var(--ink-muted);
		font-family: var(--font-ui);
		font-size: var(--type-caption-size);
		white-space: nowrap;
	}
	.folders {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-block-size: 0;
		padding-block-start: var(--space-3);
		border-block-start: var(--stroke-hairline) solid var(--hairline);
	}
	.head {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-block-size: var(--target);
		padding-inline: var(--space-2);
	}
	h2 {
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
		letter-spacing: 0;
		color: var(--ink-secondary);
	}
	.tools {
		display: flex;
		gap: var(--space-0-5);
		margin-inline-end: calc(-1 * var(--space-1));
	}
	.scroll {
		flex: 1;
		min-block-size: 0;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		padding-block-end: var(--space-2);
	}
	.path {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-0-5) 0;
		padding: var(--space-1) var(--space-2) var(--space-2);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.path li {
		display: flex;
		align-items: center;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.path li + li::before {
		content: '/';
		padding-inline: var(--space-1);
		color: var(--ink-muted);
	}
	.path a,
	.path .more {
		display: block;
		min-inline-size: 0;
		max-inline-size: 11ch;
		min-block-size: var(--target);
		padding: 0 var(--space-0-5);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: inherit;
		line-height: var(--target);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.path .more {
		min-inline-size: var(--target);
		background: var(--surface-tint);
		font-weight: var(--weight-bold);
		letter-spacing: 0.08em;
		max-inline-size: none;
	}
	.path[data-open] {
		display: grid;
		gap: 0;
		padding-block-end: var(--space-1);
	}
	.path[data-open] li + li::before {
		content: none;
	}
	.path[data-open] a {
		max-inline-size: 100%;
		white-space: normal;
		overflow-wrap: anywhere;
		line-height: var(--type-caption-line);
		padding-block: var(--space-1);
		display: block;
	}
	.path .fold .more {
		background: none;
		font-weight: var(--weight-medium);
		letter-spacing: 0;
		text-decoration: underline;
	}
	.focus {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		margin-block-end: var(--space-1);
		padding: var(--space-1-5) var(--space-2) var(--space-2);
		border-block-end: var(--stroke-hairline) solid var(--hairline);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}
	.focus :global(svg) {
		margin-block-start: 2px;
	}
	.focus span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-2);
		color: var(--ink-secondary);
	}
	.outline {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--target), 36px);
		padding: 0 var(--space-3);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-pill);
		background: none;
		color: var(--ink);
		font-weight: var(--weight-medium);
	}
	.tags {
		padding-block-start: var(--space-2);
		border-block-start: var(--stroke-hairline) solid var(--hairline);
	}
	.tags .head .n {
		color: var(--ink-muted);
		font-variant-numeric: var(--numeric-figures);
		font-size: var(--type-caption-size);
	}
	.tags ul {
		max-block-size: 9.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.tags a {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--target), 30px);
		padding: 0 var(--space-2);
		border-radius: var(--radius-text);
		color: var(--ink);
		text-decoration: none;
	}
	.tags .t {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tags .c {
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.tags a :global(svg) {
		color: var(--ink-muted);
	}
	@media (hover: hover) {
		.icon:hover,
		.quick a:hover,
		.quick button:hover,
		.tags a:hover,
		.path a:hover {
			background: var(--surface-tint);
		}
	}
</style>
