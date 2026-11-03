<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import type { Id, Note, NotePatch } from '#lib/types.ts';
	import Dialog from '#lib/ui/Dialog.svelte';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/ui/Menu.svelte';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import { deleteNoteRequest } from './api.ts';

	let { note, onchange, ondeleted }: { note: Note; onchange(patch: NotePatch): void; ondeleted(folderId: Id | null): void } = $props();

	let open = $state(false);
	let moving = $state(false);
	let deleting = $state(false);
	let anchor = $state<HTMLButtonElement | null>(null);

	const items = $derived<MenuItem[]>([
		{ label: 'Search', icon: 'search', onselect: openPalette },
		{ label: note.pinned ? 'Unpin' : 'Pin', icon: 'pin', onselect: () => onchange({ pinned: !note.pinned }) },
		{ label: 'Move to…', icon: 'move', onselect: () => (moving = true) },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (deleting = true) }
	]);

	async function remove() {
		deleting = false;
		await deleteNoteRequest(note.id);
		ondeleted(note.folderId);
		void invalidate('app:tree');
	}
</script>

<button type="button" class="more glass" aria-label="Note menu" aria-haspopup="menu" aria-expanded={open} bind:this={anchor} onclick={() => (open = !open)}>
	<Icon name="more" />
</button>
<Menu {open} {anchor} label="Note menu" {items} onclose={() => (open = false)} />
<FolderPicker
	open={moving}
	tree={page.data.tree}
	current={note.folderId}
	onpick={(folderId) => {
		moving = false;
		if (folderId !== note.folderId) onchange({ folderId });
	}}
	oncancel={() => (moving = false)}
/>
<Dialog open={deleting} title="Delete note" message={COPY.deleteNote(note.title.trim() || COPY.untitled)} confirmLabel="Delete" danger onconfirm={remove} oncancel={() => (deleting = false)} />

<style>
	.more {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: var(--control);
		block-size: var(--control);
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.more:hover {
		transform: scale(1.05);
	}

	.more:active {
		transform: scale(0.94);
	}
</style>
