<script lang="ts">
	import type { Snippet } from 'svelte';
	import { noteName } from '#lib/motion.ts';
	import type { Id, IsoDateTime } from '#lib/types.ts';
	import NoteTitle from './NoteTitle.svelte';

	type Props = {
		noteId: Id;
		title: string;
		createdAt: IsoDateTime;
		updatedAt: IsoDateTime;
		autofocus?: boolean;
		ontitle(title: string): void;
		onblur?(): void;
		onenter?(): void;
		icon: Snippet;
		children?: Snippet;
	};

	let { noteId, title, createdAt, updatedAt, autofocus = false, ontitle, onblur, onenter, icon, children }: Props = $props();

	const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
	const edited = $derived(new Date(updatedAt));
</script>

<!-- the morph target: a note card with the same name turns into this header (shell/morph.ts) -->
<header class="note-header" data-note-header data-morph={noteName(noteId)}>
	{@render icon()}
	<NoteTitle value={title} {autofocus} oninput={ontitle} {onblur} {onenter} />
	{@render children?.()}
	<p class="edited tnum">Edited {day.format(edited)}, {time.format(edited)} · Created {day.format(new Date(createdAt))}</p>
</header>

<style>
	.note-header {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
		margin-block-end: var(--s-10);
	}

	.edited {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	@media (max-width: 1023px) {
		.note-header {
			margin-block-end: var(--s-8);
		}
	}
</style>
