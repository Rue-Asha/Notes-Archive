<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import { COPY } from '#lib/copy.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { Id, Tree, TreeFolder } from '#lib/types.ts';
	import { ancestorsOf, type Target } from './tree.ts';
	import DeleteFolder from './DeleteFolder.svelte';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import FolderMenu from './FolderMenu.svelte';
	import TreeRow from './TreeRow.svelte';

	let { tree, onnavigate }: { tree: Tree; onnavigate?(): void } = $props();

	const here = $derived<Target | null>(
		page.route.id === '/(app)/notes/[id]' ? { note: Number(page.params.id) } : page.route.id === '/(app)/folders/[id]' ? { folder: Number(page.params.id) } : null
	);

	const open = new SvelteSet<Id>();

	// the current item's ancestors open when it changes, and stay open after that
	$effect(() => {
		if (!here) return;
		for (const id of ancestorsOf(tree, here)) open.add(id);
	});

	function toggle(id: Id) {
		if (!open.delete(id)) open.add(id);
	}

	let menu = $state<{ folder: TreeFolder; anchor: HTMLElement } | null>(null);
	let menuOpen = $state(false);
	let renaming = $state<Id | null>(null);

	function openMenu(folder: TreeFolder, anchor: HTMLElement) {
		menu = { folder, anchor };
		menuOpen = true;
	}

	async function create(parentId: Id | null) {
		const id = await newFolder(parentId);
		if (parentId !== null) open.add(parentId);
		await invalidate('app:tree');
		renaming = id;
	}

	let deleting = $state<TreeFolder | null>(null);
	const inside = $derived(
		deleting !== null && here !== null && (('folder' in here && here.folder === deleting.id) || ancestorsOf(tree, here).includes(deleting.id))
	);

	let moving = $state<TreeFolder | null>(null);

	async function move(folder: TreeFolder, parentId: Id | null) {
		moving = null;
		if (parentId !== null) open.add(parentId);
		await fetch(`/api/folders/${folder.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ parentId }) });
		await invalidate('app:tree');
	}

	async function rename(id: Id, name: string) {
		renaming = null;
		await fetch(`/api/folders/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
		await invalidate('app:tree');
	}
</script>

{#snippet branch(folders: TreeFolder[], level: number)}
	<ul role={level === 1 ? 'tree' : 'group'}>
		{#each folders as folder (folder.id)}
			{@const expanded = open.has(folder.id)}
			<li role="treeitem" aria-selected={here !== null && 'folder' in here && here.folder === folder.id} aria-expanded={folder.children.length || folder.notes.length ? expanded : undefined}>
				<TreeRow item={folder} {level} {expanded} current={here !== null && 'folder' in here && here.folder === folder.id} {onnavigate} ontoggle={() => toggle(folder.id)} onmenu={(anchor) => openMenu(folder, anchor)} renaming={renaming === folder.id} onrename={(name) => rename(folder.id, name)} oncancel={() => (renaming = null)} />
				{#if expanded}
					{#if folder.notes.length}
						<ul role="group">
							{#each folder.notes as note (note.id)}
								{@const isHere = here !== null && 'note' in here && here.note === note.id}
								<li role="treeitem" aria-selected={isHere}><TreeRow item={note} level={level + 1} current={isHere} {onnavigate} /></li>
							{/each}
						</ul>
					{/if}
					{@render branch(folder.children, level + 1)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class="tree">
	{#if tree.folders.length}
		{@render branch(tree.folders, 1)}
	{:else}
		<p class="empty">{COPY.noFolders}</p>
	{/if}
	{#if tree.rootNotes.length}
		<ul role="group">
			{#each tree.rootNotes as note (note.id)}
				{@const isHere = here !== null && 'note' in here && here.note === note.id}
				<li role="treeitem" aria-selected={isHere}><TreeRow item={note} level={1} current={isHere} {onnavigate} /></li>
			{/each}
		</ul>
	{/if}

	<button class="new" type="button" onclick={() => create(null)}><Icon name="plus" size={16} /><span>{COPY.newFolder}</span></button>
</div>

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
	/* the sidebar's scroll area is a grid: without this a long name widens its column instead of truncating */
	.tree {
		contain: inline-size;
	}

	.empty {
		padding-inline: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-body);
	}

	.new {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		inline-size: 100%;
		min-block-size: 36px;
		padding-inline: var(--s-2);
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink-2);
		font-size: var(--t-body);
		text-align: start;
	}

	.new:hover {
		background: var(--row-hover);
	}

	/* the drawer's mockup keeps New folder pinned at the bottom as a pill */
	@media (max-width: 1023px) {
		.new {
			position: sticky;
			inset-block-end: 0;
			justify-content: center;
			min-block-size: 44px;
			border: 1px solid var(--line);
			border-radius: var(--r-pill);
			background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
			color: var(--ink);
			font-weight: 500;
		}
	}
</style>
