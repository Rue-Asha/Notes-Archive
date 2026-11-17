<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import { COPY } from '#lib/copy.ts';
	import { titleLine } from '#lib/title.ts';
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
	let anchor = $state<HTMLElement | null>(null);

	const items = $derived<MenuItem[]>([
		{ label: 'Search', icon: 'search', kbd: 'Ctrl K', onselect: openPalette },
		{ label: note.pinned ? 'Unpin' : 'Pin', icon: 'pin', onselect: () => onchange({ pinned: !note.pinned }) },
		{ label: 'Move to…', icon: 'folder', onselect: () => (moving = true) },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (deleting = true) }
	]);

	async function remove() {
		deleting = false;
		await deleteNoteRequest(note.id);
		ondeleted(note.folderId);
		void invalidate('app:tree');
	}
</script>

<span class="host" bind:this={anchor}>
	<Button variant="quiet" icon label="Note menu" aria-haspopup="menu" aria-expanded={open} onclick={() => (open = !open)}><Icon name="more" size={20} /></Button>
</span>
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
<Dialog open={deleting} title={COPY.deleteAsk(titleLine(note.title))} message={COPY.cantUndo} confirmLabel={COPY.deleteNoteLabel} danger onconfirm={remove} oncancel={() => (deleting = false)} />

<style>
	.host {
		display: inline-flex;
	}
</style>
