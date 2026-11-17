<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import { COPY } from '#lib/copy.ts';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import RenameField from '#lib/shell/tree/RenameField.svelte';
	import type { Crumb, Folder, Id, Tree } from '#lib/types.ts';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Menu from '#lib/ui/Menu.svelte';
	import { renameFolder } from './api.ts';
	import Breadcrumb from './Breadcrumb.svelte';
	import CoverControl from './CoverControl.svelte';
	import DeleteFolder from './DeleteFolder.svelte';

	type Props = { folder: Folder; crumbs: Crumb[]; counts: { folders: number; notes: number }; empty: boolean; onadded(id: Id): void };

	let { folder, crumbs, counts, empty, onadded }: Props = $props();

	const parent = $derived(crumbs.length > 1 ? crumbs[crumbs.length - 2] : null);
	const hasCover = $derived(folder.coverImageId !== null);
	// the last word carries the accent
	const cut = $derived(folder.name.trimEnd().lastIndexOf(' '));
	const lead = $derived(cut > 0 ? folder.name.slice(0, cut + 1) : '');
	const tail = $derived(cut > 0 ? folder.name.slice(cut + 1) : folder.name);

	let renaming = $state(false);
	let menuOpen = $state(false);
	let moving = $state(false);
	let deleting = $state(false);
	let anchor = $state<HTMLElement | null>(null);

	const items = $derived([
		{ label: 'Rename', icon: 'file', onselect: () => (renaming = true) },
		{ label: 'Move to…', icon: 'move', onselect: () => (moving = true) },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (deleting = true) }
	]);

	async function addFolder() {
		onadded(await newFolder(folder.id));
		await invalidateAll();
	}

	async function rename(name: string) {
		renaming = false;
		await renameFolder(folder.id, name);
	}

	async function move(parentId: Id | null) {
		moving = false;
		await fetch(`/api/folders/${folder.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ parentId }) });
		await invalidateAll();
	}
</script>

<div class="head">
	<nav class="back" aria-label="Back">
		<Button variant="glass" size="s" href={parent ? `/folders/${parent.id}` : '/folders'} title={parent?.name ?? COPY.folders}>
			<Icon name="chevronLeft" size={18} /><span>{parent?.name ?? COPY.folders}</span>
		</Button>
	</nav>

	<header class="screen-head" class:covered={hasCover} data-folder-header>
		{#if hasCover}
			<figure class="cover" aria-hidden="true" data-cover><img src="/images/{folder.coverImageId}" alt="" /></figure>
		{/if}
		<div class="screen-lead">
			<Breadcrumb {crumbs} />
			{#if renaming}
				<RenameField value={folder.name} onsubmit={rename} oncancel={() => (renaming = false)} />
			{:else}
				<h1 data-long={folder.name.length > 28 || undefined} lang="de" dir="auto">{lead}<em class="accent-word">{tail}</em></h1>
			{/if}
			<p class="lede" data-folder-counts>{COPY.folderCounts(counts.folders, counts.notes)}</p>
			<div class="actions">
				<CoverControl folderId={folder.id} {hasCover} />
				{#if !empty}
					<span class="primary-slot"><Button variant="primary" arrow onclick={() => newNote(folder.id)}>{COPY.newNote}</Button></span>
					<Button variant="glass" size="s" onclick={addFolder}><Icon name="folderPlus" size={16} /><span>{COPY.newFolder}</span></Button>
				{/if}
				<span class="host" bind:this={anchor}>
					<Button variant="glass" size="xs" icon label="Folder menu" aria-haspopup="menu" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}><Icon name="more" size={20} /></Button>
				</span>
			</div>
		</div>
	</header>
</div>

<Menu open={menuOpen} {anchor} label="Folder menu" {items} onclose={() => (menuOpen = false)} />
<FolderPicker open={moving} tree={page.data.tree as Tree} current={folder.parentId} exclude={folder.id} onpick={move} oncancel={() => (moving = false)} />
<DeleteFolder folder={deleting ? { id: folder.id, name: folder.name, parentId: folder.parentId, children: [], notes: [] } : null} inside onclose={() => (deleting = false)} />

<style>
	.head {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
		/* the cover runs out to the frame edge behind the title; the page sets how far */
		--bleed-x: var(--gutter);
		--bleed-t: var(--area-top);
	}

	/* above the cover, which bleeds up behind it */
	.back {
		position: relative;
		z-index: var(--z-raised);
		display: grid;
		justify-items: start;
		min-inline-size: 0;
	}

	.back :global(.btn) {
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target-touch));
	}

	.back :global(.text) {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (min-width: 1100px) {
		.back {
			display: none;
		}
	}

	.screen-head {
		padding-block: var(--space-4) 0;
	}

	.screen-lead {
		grid-template-columns: minmax(0, 1fr);
		max-inline-size: 48rem;
	}

	.screen-lead::before {
		content: none;
	}

	h1 {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	h1[data-long] {
		max-inline-size: 16em;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		margin-block-start: var(--space-1);
	}

	.host {
		display: inline-flex;
	}

	/* phone: the two labelled buttons share the row and give way before the menu button wraps alone */
	@media (max-width: 479px) {
		.actions {
			flex-wrap: nowrap;
		}

		.actions :global(.btn.s) {
			flex: 0 1 auto;
			min-inline-size: 0;
			padding-inline: var(--space-3);
		}

		.actions :global(.btn.xs) {
			flex: none;
		}
	}

	/* below 1100 px the dock's round button (or the sidebar) already makes a note in this folder */
	.primary-slot {
		display: contents;
	}

	@media (max-width: 1099px) {
		.primary-slot {
			display: none;
		}
	}

	.covered {
		position: relative;
		isolation: isolate;
	}

	.cover {
		position: absolute;
		z-index: -1;
		inset-block: calc(-1 * var(--bleed-t) - var(--space-14)) calc(-1 * var(--space-4));
		inset-inline: calc(-1 * var(--bleed-x));
		margin: 0;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(var(--ink) calc(100% - var(--stage-fade)), transparent);
		mask-image: linear-gradient(var(--ink) calc(100% - var(--stage-fade)), transparent);
	}

	.cover img {
		inline-size: 100%;
		block-size: 100%;
		max-inline-size: none;
		object-fit: cover;
	}

	/* the scrim holds at text strength under the title and counts and softens only behind the glass buttons */
	.cover::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, var(--scrim-text) 0, var(--scrim-text) calc(100% - var(--stage-fade)), var(--scrim-soft) 100%);
	}

	@media (min-width: 1100px) {
		.cover {
			inset-block-start: calc(-1 * var(--bleed-t));
			inset-inline-start: 0;
		}

		.cover::after {
			background: linear-gradient(90deg, var(--scrim-text) 0, var(--scrim-text) 56%, var(--scrim-clear));
		}
	}
</style>
