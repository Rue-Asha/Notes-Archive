<script lang="ts">
	import type { NoteCard } from '#lib/types.ts';
	import Card from './NoteCard.svelte';
	import { arrive, depart, reflow } from '#lib/ui/motion.ts';

	let { notes, home = false, tagged = false }: { notes: NoteCard[]; home?: boolean; tagged?: boolean } = $props();
</script>

<ul class="entries" class:home={home || tagged} data-note-grid>
	{#each notes as note (note.id)}<li animate:reflow in:arrive|global out:depart><Card {note} {home} {tagged} /></li>{/each}
</ul>

<style>
	.entries {
		display: grid;
		gap: var(--space-2);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
	}

	.home {
		grid-template-columns: minmax(0, 1fr);
	}

	li {
		min-inline-size: 0;
	}
</style>
