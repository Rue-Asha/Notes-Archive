<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import Icon from './Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import SortMenu from './SortMenu.svelte';
	import { cueY } from '#lib/components/scroll-cue/cue.ts';
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
		tag?: boolean;
		menuOpen?: boolean;
		moreOpen?: boolean;
		renameId?: number | null;
		sortFails?: boolean;
		onsortfail?: () => void;
	};
	let { view, tags, sort, worst, rail = $bindable(false), current = null, tag = false, menuOpen = false, moreOpen = false, renameId = null, sortFails = false, onsortfail }: Props = $props();

	/* svelte-ignore state_referenced_locally */
	let renaming = $state<number | null>(renameId);
	let names = $state<Record<number, string>>({});
	function rename(id: number, name: string | null) {
		if (name !== null) names[id] = name;
		renaming = null;
	}

	// a screen mounts its own shell, so the props only seed the state
	/* svelte-ignore state_referenced_locally */
	const open = new SvelteSet<number>(view.open);
	const toggle = (id: number) => (open.has(id) ? open.delete(id) : open.add(id));

	/* svelte-ignore state_referenced_locally */
	let more = $state(moreOpen);
	const HIDE_FROM = 10;
	const shortened = $derived(view.path.length >= HIDE_FROM && !more);
	const crumbs = $derived(shortened ? [view.path[0], ...view.path.slice(-2)] : view.path);

	let region = $state<HTMLElement>();
	// the open note's row starts in view, clear of the fade
	$effect(() => {
		const row = region?.querySelector<HTMLElement>('.name[aria-current="page"]');
		if (!region || !row) return;
		const top = row.getBoundingClientRect().top - region.getBoundingClientRect().top;
		const room = region.clientHeight - row.offsetHeight - 64;
		if (top > room) region.scrollTop += top - room;
	});

	function key(e: KeyboardEvent) {
		const li = e.target as HTMLElement;
		if (!li.matches('[role=treeitem]')) return;
		const items = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=treeitem]')];
		const at = items.indexOf(li);
		const go = (to?: HTMLElement) => {
			if (!to) return;
			e.preventDefault();
			for (const it of items) it.tabIndex = -1;
			to.tabIndex = 0;
			to.focus();
		};
		const chev = li.querySelector<HTMLButtonElement>(':scope > .row > button.chev');
		if (e.key === 'ArrowDown') go(items[at + 1]);
		else if (e.key === 'ArrowUp') go(items[at - 1]);
		else if (e.key === 'Home') go(items[0]);
		else if (e.key === 'End') go(items.at(-1));
		else if (e.key === 'ArrowRight') {
			if (li.getAttribute('aria-expanded') === 'false') (e.preventDefault(), chev?.click());
			else if (li.getAttribute('aria-expanded') === 'true') go(items[at + 1]);
		} else if (e.key === 'ArrowLeft') {
			if (li.getAttribute('aria-expanded') === 'true') (e.preventDefault(), chev?.click());
			else go(li.parentElement?.closest<HTMLElement>('[role=treeitem]') ?? undefined);
		} else if (e.key === 'Enter') li.querySelector<HTMLElement>(':scope > .row > a')?.click();
	}
</script>

{#if rail}
	<nav class="side rail" aria-label="Sidebar">
		<Button variant="quiet" size="xs" icon aria-label="Unfold sidebar" aria-expanded="false" onclick={() => (rail = false)}><Icon name="sidebar" /></Button>
		<ul class="capsule">
			<li><Button variant="quiet" size="xs" icon href={link('home', worst)} aria-label="Home" aria-current={current === 'home' ? 'page' : undefined}><Icon name="home" /></Button></li>
			<li><Button variant="quiet" size="xs" icon aria-label="Search"><Icon name="search" /></Button></li>
			<li><Button variant="primary" size="xs" icon aria-label="New note"><Icon name="plus" /></Button></li>
		</ul>
	</nav>
{:else}
	<nav class="side" aria-label="Sidebar">
		<div class="top">
			<a class="brand" href={link('home', worst)}><span class="brand-mark" aria-hidden="true">N</span><span class="brand-name">Notes Archive</span></a>
			<Button variant="quiet" size="xs" icon aria-label="Fold sidebar" aria-expanded="true" onclick={() => (rail = true)}><Icon name="sidebar" /></Button>
		</div>

		<ul class="actions">
			<li>
				<a class="act" href={link('home', worst)} aria-current={current === 'home' ? 'page' : undefined}><span class="disc"><Icon name="home" size={16} /></span><span class="t">Home</span></a>
			</li>
			<li>
				<button type="button" class="act" aria-current={current === 'search' ? 'page' : undefined}><span class="disc"><Icon name="search" size={16} /></span><span class="t">Search</span><kbd>Ctrl K</kbd></button>
			</li>
			<li>
				<button type="button" class="act primary" data-focus="halo"><span class="disc"><Icon name="plus" size={16} /></span><span class="t">New note</span></button>
			</li>
		</ul>

		<section class="folders" aria-labelledby="side-folders">
			<div class="head">
				<h2 class="ruled" id="side-folders">Folders</h2>
				<div class="tools">
					<Button variant="quiet" size="xs" icon aria-label="New folder"><Icon name="folderPlus" size={16} /></Button>
					<SortMenu mode={sort} open={menuOpen} fails={sortFails} onfail={onsortfail} />
				</div>
			</div>

			<div class="scroll hf-scroll-y" bind:this={region} use:cueY>
				{#if view.focus}
					<nav class="path-row" aria-label="Path">
						<ol data-open={more || undefined} lang="de">
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
					</nav>
					<p class="focus" title={view.focus.name}><Icon name="folder" size={16} /><span lang="de">{view.focus.name}</span></p>
				{/if}

				{#if view.empty}
					<div class="empty">
						<p class="nothing">No folders yet</p>
						<p>Folders keep related notes together.</p>
						<Button size="s"><Icon name="folderPlus" size={16} />New folder</Button>
					</div>
				{:else}
					<div class="tree" role="presentation" onkeydown={key}>
						<TreeBranch nodes={view.nodes} notes={view.notes} current={view.current} {open} {worst} {toggle} {renaming} {names} {rename} />
					</div>
				{/if}
			</div>
		</section>

		{#if tags.length}
			<section class="tags" aria-labelledby="side-tags">
				<div class="head"><h2 class="ruled" id="side-tags">Tags</h2><span class="n">{tags.length.toLocaleString('en')}</span></div>
				<ul class="hf-scroll-y" use:cueY>
					{#each tags as t, i (t.id)}
						<li>
							<a href={link('tag', worst)} aria-current={tag && i === 0 ? 'page' : undefined} title="{t.name} · {plural(t.count, 'note')}"><span class="t">{t.name}</span><span class="c">{t.count.toLocaleString('en')}</span></a>
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
		gap: var(--space-4);
		block-size: 100%;
		min-block-size: 0;
		min-inline-size: 0;
		padding: var(--space-3-5) var(--space-2-5) var(--space-4);
		border-radius: var(--radius-card);
		background: var(--surface-glass);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-rim);
	}
	/* layout.css's phone .rail pushes itself down by the photo gap; this rail is the folded sidebar, not that one */
	.side.rail {
		margin: 0;
		align-items: center;
		block-size: auto;
		inline-size: var(--rail-width);
		padding: var(--space-2);
		border-radius: var(--radius-pill);
	}
	.capsule {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
	}
	.capsule :global(.btn.quiet) {
		color: var(--ink);
	}
	.capsule :global(a[aria-current]) {
		background: var(--surface-tint-strong);
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
	.act[aria-current],
	.tags a[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-weight: var(--weight-semibold);
	}
	.act[aria-current] .disc {
		color: var(--ink);
	}
	.act[aria-current] kbd,
	.tags a[aria-current] .c {
		color: var(--ink-on-inverse-secondary);
	}
	.act[aria-current] kbd {
		box-shadow: var(--ring-on-inverse);
	}
	.act[aria-current]:focus-visible,
	.tags a[aria-current]:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	/* the dark arrow pill on the screen is the one primary; New note here is a quiet row with a dark disc */
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
	@media (pointer: coarse) {
		.act kbd {
			display: none;
		}
	}
	.folders {
		display: flex;
		flex-direction: column;
		flex: 1 1 14rem;
		gap: var(--space-2);
		min-block-size: 10rem;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-block-size: var(--target);
		padding-inline: var(--space-1) var(--space-1);
	}
	.tools {
		display: flex;
		gap: var(--space-0-5);
	}
	.scroll {
		flex: 1;
		min-block-size: 0;
		overflow-x: hidden;
	}
	.path-row {
		display: grid;
		gap: var(--space-0-5);
		padding: 0 var(--space-1) var(--space-2);
	}
	.path-row ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.path-row li {
		display: flex;
		align-items: center;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.path-row li + li::before {
		content: '/';
		padding-inline: var(--space-1);
		color: var(--ink-muted);
	}
	.path-row ol a,
	.path-row .more {
		display: block;
		min-inline-size: 0;
		max-inline-size: 11ch;
		min-block-size: var(--target);
		padding: 0 var(--space-1);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: inherit;
		line-height: var(--target);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.path-row .more {
		min-inline-size: var(--target);
		max-inline-size: none;
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink);
		font-weight: var(--weight-bold);
		letter-spacing: 0.08em;
	}
	.path-row ol[data-open] {
		display: grid;
	}
	.path-row ol[data-open] li + li::before {
		content: none;
	}
	.path-row ol[data-open] a {
		max-inline-size: 100%;
		white-space: normal;
		overflow-wrap: anywhere;
		hyphens: auto;
		line-height: var(--type-caption-line);
		padding-block: var(--space-1-5);
	}
	.path-row .fold .more {
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
		padding: var(--space-1-5) var(--space-2-5) var(--space-2-5);
		box-shadow: var(--rule-below);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--weight-semibold);
	}
	.focus :global(svg) {
		margin-block-start: var(--space-0-5);
		color: var(--ink-secondary);
	}
	.focus span {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-2-5);
		color: var(--ink-secondary);
	}
	.nothing {
		color: var(--ink);
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.empty :global(.btn) {
		margin-block-start: var(--space-2);
	}
	.tags {
		display: flex;
		flex-direction: column;
		flex: 0 1 auto;
		gap: var(--space-1);
		min-block-size: 0;
	}
	.tags .n {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.tags ul {
		min-block-size: 0;
		max-block-size: 10rem;
	}
	.tags a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-block-size: max(32px, var(--target));
		padding-inline: var(--space-3);
		border-radius: var(--radius-pill);
		color: var(--ink);
		text-decoration: none;
	}
	.tags .t {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tags .c {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	@media (hover: hover) {
		.act:not([aria-current]):hover,
		.tags a:not([aria-current]):hover,
		.path-row ol a:hover {
			background: var(--surface-hover);
		}
	}
</style>
