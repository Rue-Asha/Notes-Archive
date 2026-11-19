<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import Button from '#lib/components/button/Button.svelte';
	import { cueY } from '#lib/components/scroll-cue/cue.ts';
	import { COPY } from '#lib/copy.ts';
	import DeleteFolder from '#lib/folders/DeleteFolder.svelte';
	import FolderMenu from '#lib/folders/FolderMenu.svelte';
	import { ancestorsOf } from '#lib/folders/tree.ts';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import type { Id, Tree, TreeFolder } from '#lib/types.ts';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import { focusView, shortenPath, type FocusTarget } from '../focus.ts';
	import SortMenu from '../SortMenu.svelte';
	import Icon from './Icon.svelte';
	import RenameField from './RenameField.svelte';
	import TreeBranch from './TreeBranch.svelte';

	let { tree }: { tree: Tree } = $props();

	const target = $derived<FocusTarget>(
		page.route.id === '/(app)/notes/[id]' ? { note: Number(page.params.id) } : page.route.id === '/(app)/folders/[id]' ? { folder: Number(page.params.id) } : null
	);
	const view = $derived(focusView(tree, target));
	const empty = $derived(tree.folders.length === 0);
	const uid = $props.id();

	// a chevron click overrides the default until reload; the default opens the current item's ancestors
	const manual = new SvelteMap<Id, boolean>();
	const expanded = (id: Id) => manual.get(id) ?? view.expand.includes(id);
	const toggle = (id: Id) => manual.set(id, !expanded(id));

	// every folder of the shown level that has something inside, at any depth
	const branches = $derived.by(() => {
		const ids: Id[] = [];
		const walk = (folders: TreeFolder[]) => {
			for (const f of folders) {
				if (f.children.length || f.notes.length) ids.push(f.id);
				walk(f.children);
			}
		};
		walk(view.folders);
		return ids;
	});
	const allOpen = $derived(branches.length > 0 && branches.every(expanded));
	const setAll = () => {
		for (const id of branches) manual.set(id, !allOpen);
	};

	let all = $state(false);
	const path = $derived(shortenPath(view.path, all));
	$effect(() => {
		void view.focus?.id;
		all = false;
	});
	let pathList = $state<HTMLOListElement>();

	// the control that was pressed goes away, so the focus moves to the first folder it showed, or back to "…"
	async function showPath(open: boolean) {
		const shown = 1 + path.head.length;
		all = open;
		await tick();
		if (open) pathList?.querySelectorAll<HTMLElement>('a')[shown]?.focus();
		else pathList?.querySelector<HTMLElement>('.more-path')?.focus();
	}

	let region = $state<HTMLElement>();
	// the open note's row starts in view, clear of the fade
	$effect(() => {
		void view.current;
		const row = region?.querySelector<HTMLElement>('.name[aria-current="page"]');
		if (!region || !row) return;
		const top = row.getBoundingClientRect().top - region.getBoundingClientRect().top;
		const room = region.clientHeight - row.offsetHeight - 64;
		if (top > room) region.scrollTop += top - room;
	});

	let menu = $state<{ folder: TreeFolder; anchor: HTMLElement } | null>(null);
	let menuOpen = $state(false);
	let renaming = $state<Id | null>(null);
	let deleting = $state<TreeFolder | null>(null);
	let moving = $state<TreeFolder | null>(null);

	function openMenu(folder: TreeFolder, anchor: HTMLElement) {
		menu = { folder, anchor };
		menuOpen = true;
	}

	async function create(parentId: Id | null) {
		const id = await newFolder(parentId);
		if (parentId !== null) manual.set(parentId, true);
		await invalidate('app:tree');
		renaming = id;
	}

	async function rename(id: Id, name: string) {
		renaming = null;
		await fetch(`/api/folders/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
		await invalidate('app:tree');
	}

	async function move(folder: TreeFolder, parentId: Id | null) {
		moving = null;
		if (parentId !== null) manual.set(parentId, true);
		await fetch(`/api/folders/${folder.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ parentId }) });
		await invalidate('app:tree');
	}

	const inside = $derived(
		deleting !== null && target !== null && (('folder' in target && target.folder === deleting.id) || ancestorsOf(tree, target).includes(deleting.id))
	);

	// roving tabindex: the last treeitem that had the focus stays the tab stop while it is in the tree, else the first one
	let roving = $state<string | null>(null);
	const visible = $derived.by(() => {
		const keys: string[] = [];
		const walk = (folders: TreeFolder[], notes: { id: Id }[]) => {
			for (const f of folders) {
				keys.push(`f${f.id}`);
				if (expanded(f.id)) walk(f.children, f.notes);
			}
			for (const n of notes) keys.push(`n${n.id}`);
		};
		walk(view.folders, view.notes);
		return keys;
	});
	const tabbable = $derived(roving !== null && visible.includes(roving) ? roving : (visible[0] ?? null));

	function key(e: KeyboardEvent) {
		const li = e.target as HTMLElement;
		if (!li.matches('[role=treeitem]')) return;
		const items = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=treeitem]')];
		const at = items.indexOf(li);
		const go = (to?: HTMLElement) => {
			if (!to) return;
			e.preventDefault();
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
		else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
			e.preventDefault();
			li.querySelector<HTMLElement>(':scope > .row > .more')?.click();
		}
	}
</script>

<section class="folders" aria-labelledby="{uid}-folders">
	<div class="head">
		<h2 class="ruled" id="{uid}-folders">{COPY.folders}</h2>
		<div class="tools">
			{#if branches.length}
				<Button variant="quiet" size="xs" icon label={allOpen ? COPY.collapseAll : COPY.expandAll} onclick={setAll}><Icon name={allOpen ? 'collapseAll' : 'expandAll'} size={16} /></Button>
			{/if}
			{#if !empty}
				<Button variant="quiet" size="xs" icon label={COPY.newFolder} onclick={() => create(view.focus?.id ?? null)}><Icon name="folderPlus" size={16} /></Button>
			{/if}
			<SortMenu placement="tree" />
		</div>
	</div>

	<div class="scroll" bind:this={region} use:cueY>
		{#if view.focus}
			<nav class="path-row" aria-label="Path">
				<ol data-open={all || undefined} lang="de" bind:this={pathList}>
					<li><a href="/folders">{COPY.folders}</a></li>
					{#each path.head as c (c.id)}
						<li><a href="/folders/{c.id}" title={c.name}>{c.name}</a></li>
					{/each}
					{#if path.hidden}
						<li><button type="button" class="more-path" aria-label="Show all {view.path.length} parent folders" aria-expanded="false" onclick={() => showPath(true)}>…</button></li>
					{/if}
					{#each path.tail as c (c.id)}
						<li><a href="/folders/{c.id}" title={c.name}>{c.name}</a></li>
					{/each}
					{#if all && view.path.length >= 10}
						<li class="fold"><button type="button" class="more-path" aria-expanded="true" onclick={() => showPath(false)}>Shorten path</button></li>
					{/if}
				</ol>
			</nav>
			{@const focus = view.focus}
			<div class="focus" title={focus.name}>
				<Icon name="folder" size={16} />
				{#if renaming === focus.id}
					<RenameField value={focus.name} focused onsubmit={(n) => rename(focus.id, n)} oncancel={() => (renaming = null)} />
				{:else}
					<span lang="de">{focus.name}</span>
					<button type="button" class="more" aria-label="{focus.name} menu" aria-haspopup="menu" onclick={(e) => openMenu(focus, e.currentTarget)}><Icon name="more" size={16} /></button>
				{/if}
			</div>
		{/if}

		{#if empty}
			<div class="empty">
				<p class="nothing">{COPY.noFolders}</p>
				<p>Folders keep related notes together.</p>
				<Button size="s" onclick={() => create(null)}><Icon name="folderPlus" size={16} />{COPY.newFolder}</Button>
			</div>
		{/if}
		{#if view.folders.length || view.notes.length}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="tree" onkeydown={key} onfocusin={(e) => (e.target as HTMLElement).matches('[role=treeitem]') && (roving = (e.target as HTMLElement).dataset.key ?? null)}>
				<TreeBranch folders={view.folders} notes={view.notes} current={view.current} {expanded} {toggle} onmenu={openMenu} {renaming} onrename={rename} oncancel={() => (renaming = null)} {tabbable} />
			</div>
		{/if}
	</div>
</section>

<FolderMenu
	open={menuOpen}
	anchor={menu?.anchor ?? null}
	name={menu?.folder.name ?? ''}
	onnewnote={() => newNote(menu!.folder.id)}
	onnewfolder={() => create(menu!.folder.id)}
	onrename={() => (renaming = menu!.folder.id)}
	onmove={() => (moving = menu!.folder)}
	ondelete={() => (deleting = menu!.folder)}
	onclose={() => (menuOpen = false)}
/>

<FolderPicker open={moving !== null} {tree} current={moving?.parentId ?? null} exclude={moving?.id} onpick={(parentId) => move(moving!, parentId)} oncancel={() => (moving = null)} />

<DeleteFolder folder={deleting} {inside} onclose={() => (deleting = null)} />

<style>
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
		padding-inline: var(--space-1);
	}
	.tools {
		display: flex;
		gap: var(--space-0-5);
	}
	.scroll {
		flex: 1;
		min-block-size: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-block-end: var(--space-6);
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
	.path-row .more-path {
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
	.path-row .more-path {
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
	.path-row .fold .more-path {
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
	.focus > :global(svg) {
		flex: none;
		margin-block-start: var(--space-0-5);
		color: var(--ink-secondary);
	}
	.focus .more {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target-min);
		block-size: var(--target-min);
		margin-block-start: 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--ink-secondary);
	}
	.focus span {
		flex: 1;
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
	@media (hover: hover) {
		.path-row ol a:hover {
			background: var(--surface-hover);
		}
	}
</style>
