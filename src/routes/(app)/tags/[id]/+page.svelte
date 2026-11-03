<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import NoteGrid from '#lib/notes/NoteGrid.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{data.tag.name} · Notes Archive</title></svelte:head>

<div class="tag-page" data-tag-page>
	<header>
		<Eyebrow>Tag</Eyebrow>
		<h1 class="display">{data.tag.name}</h1>
		<p class="counts tnum">{COPY.noteCount(data.notes.length)}</p>
	</header>
	<NoteGrid notes={data.notes} />
</div>

<style>
	.tag-page {
		display: grid;
		gap: var(--s-8);
	}

	header {
		display: grid;
		gap: var(--s-2);
	}

	h1 {
		font-size: var(--t-display-2);
		overflow-wrap: anywhere;
	}

	.counts {
		color: var(--ink-2);
	}
</style>
