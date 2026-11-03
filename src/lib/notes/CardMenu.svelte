<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import type { Id, NoteCard } from '#lib/types.ts';
	import Dialog from '#lib/ui/Dialog.svelte';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/ui/Menu.svelte';
	import { deleteNoteRequest, patchNote } from './api.ts';

	let { note }: { note: NoteCard } = $props();

	let open = $state(false);
	let moving = $state(false);
	let deleting = $state(false);
	let anchor = $state<HTMLButtonElement | null>(null);

	const items = $derived<MenuItem[]>([
		{ label: note.pinned ? 'Unpin' : 'Pin', icon: 'pin', onselect: () => void change(patchNote(note.id, { pinned: !note.pinned })) },
		{ label: 'Move to…', icon: 'move', onselect: () => (moving = true) },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (deleting = true) }
	]);

	async function change(request: Promise<unknown>) {
		await request;
		await Promise.all([invalidateAll(), invalidate('app:tree')]);
	}

	function move(folderId: Id | null) {
		moving = false;
		void change(patchNote(note.id, { folderId }));
	}

	function remove() {
		deleting = false;
		void change(deleteNoteRequest(note.id));
	}
</script>

<button type="button" class="more" aria-label="Note actions" aria-haspopup="menu" aria-expanded={open} bind:this={anchor} onclick={() => (open = !open)}>
	<Icon name="more" size={18} />
</button>
<Menu {open} {anchor} label="Note actions" {items} onclose={() => (open = false)} />
<FolderPicker open={moving} tree={page.data.tree} current={note.folderId} onpick={move} oncancel={() => (moving = false)} />
<Dialog open={deleting} title="Delete note" message={COPY.deleteNote(note.title.trim() || COPY.untitled)} confirmLabel="Delete" danger onconfirm={remove} oncancel={() => (deleting = false)} />

<style>
	/* sits above the card's stretched link; the negative margin keeps the touch target from growing the row */
	.more {
		position: relative;
		z-index: 1;
		display: inline-grid;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		margin: -5px -8px -5px 0;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
	}

	.more:hover,
	.more[aria-expanded='true'] {
		background: var(--row-hover);
		color: var(--ink);
	}
</style>
