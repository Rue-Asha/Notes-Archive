<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import type { Reorder } from '#lib/home/pinned.ts';
	import { titleLine } from '#lib/title.ts';
	import type { Id, NoteCard } from '#lib/types.ts';
	import Dialog from '#lib/ui/Dialog.svelte';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/ui/Menu.svelte';
	import { deleteNoteRequest, patchNote } from './api.ts';

	let { note, ondeleted, reorder }: { note: NoteCard; ondeleted?: (note: NoteCard) => Promise<void> | void; reorder?: Reorder | null } = $props();

	// NoteGrid and NoteCard sit between the tag page and this menu, so the page hands its callback down by context
	const inherited = getContext<((note: NoteCard) => Promise<void> | void) | undefined>('card-deleted');

	let open = $state(false);
	let moving = $state(false);
	let deleting = $state(false);
	let anchor = $state<HTMLButtonElement | null>(null);

	const items = $derived<MenuItem[]>([
		...(reorder
			? [
					{ label: COPY.moveUp, icon: 'arrow-up', disabled: !reorder.canUp, onselect: () => reorder.up() },
					{ label: COPY.moveDown, icon: 'arrow-down', disabled: !reorder.canDown, onselect: () => reorder.down() }
				]
			: []),
		{ label: note.pinned ? 'Unpin' : 'Pin', icon: 'pin', separator: !!reorder, onselect: () => void change(patchNote(note.id, { pinned: !note.pinned })) },
		{ label: 'Move to…', icon: 'folder', onselect: () => (moving = true) },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (deleting = true) }
	]);

	async function change(request: Promise<unknown>) {
		await request;
		await Promise.all([invalidateAll(), invalidate('app:tree')]);
	}

	async function removed() {
		await deleteNoteRequest(note.id);
		const hook = ondeleted ?? inherited;
		if (!hook) return change(Promise.resolve());
		await hook(note);
		await invalidate('app:tree');
	}

	function move(folderId: Id | null) {
		moving = false;
		void change(patchNote(note.id, { folderId }));
	}

	function remove() {
		deleting = false;
		void removed();
	}
</script>

<button type="button" class="more" aria-label="Note actions" data-press="round" aria-haspopup="menu" aria-expanded={open} bind:this={anchor} onclick={() => (open = !open)}>
	<Icon name="more" size={18} />
</button>
<Menu {open} {anchor} label="Note actions" {items} onclose={() => (open = false)} />
<FolderPicker open={moving} tree={page.data.tree} current={note.folderId} onpick={move} oncancel={() => (moving = false)} />
<Dialog open={deleting} title={COPY.deleteAsk(titleLine(note.title))} message={COPY.cantUndo} confirmLabel={COPY.deleteNoteLabel} danger onconfirm={remove} oncancel={() => (deleting = false)} />

<style>
	/* sits above the entry's stretched link */
	.more {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-muted);
	}

	.more[aria-expanded='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	@media (hover: hover) {
		.more:hover {
			background: var(--surface-tint-strong);
		}

		.more[aria-expanded='true']:hover {
			background: var(--surface-inverse-hover);
		}
	}
</style>
