<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { setContext } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import NoteGrid from '#lib/notes/NoteGrid.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// the last word carries the accent
	const cut = $derived(data.tag.name.trimEnd().lastIndexOf(' '));
	const lead = $derived(cut > 0 ? data.tag.name.slice(0, cut + 1) : '');
	const tail = $derived(cut > 0 ? data.tag.name.slice(cut + 1) : data.tag.name);

	// reloading this page once its last note is gone would 404, so leave for Home instead
	setContext('card-deleted', async (note: { id: number }) => {
		if (data.notes.length === 1 && data.notes[0].id === note.id) await goto('/', { invalidateAll: true });
		else await invalidateAll();
	});
</script>

<svelte:head><title>{data.tag.name} · Notes Archive</title></svelte:head>

<div class="tag-page" data-tag-page>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Tag</li></ul>
			<h1 data-long={data.tag.name.length > 28 || undefined} lang="de" dir="auto">{lead}<em class="accent-word">{tail}</em></h1>
			<p class="lede"><span data-tag-count>{COPY.noteCount(data.notes.length)}</span>, newest edited first.</p>
		</div>
	</header>
	<div class="body">
		<NoteGrid notes={data.notes} tagged />
	</div>
</div>

<style>
	.tag-page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		min-inline-size: 0;
	}

	.screen-head {
		padding-block: var(--space-4) 0;
	}

	.screen-lead {
		grid-template-columns: minmax(0, 1fr);
		max-inline-size: 48rem;
		justify-items: start;
	}

	.screen-lead::before {
		content: none;
	}

	h1 {
		min-inline-size: 0;
		max-inline-size: 100%;
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	h1[data-long] {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}

	.body {
		min-inline-size: 0;
	}
</style>
