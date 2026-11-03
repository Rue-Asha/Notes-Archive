<script lang="ts">
	import type { NoteCard } from '#lib/types.ts';
	import Card from './NoteCard.svelte';

	let { notes }: { notes: NoteCard[] } = $props();
</script>

<div class="grid" data-note-grid>
	{#each notes as note, index (note.id)}<Card {note} {index} />{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: var(--s-4);
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	@media (min-width: 768px) {
		.grid {
			gap: var(--s-5);
		}
	}
</style>
