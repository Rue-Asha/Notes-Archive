<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import NoteEntry from '../search/NoteEntry.svelte';
	import { many, plural } from '../search/data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const name = $derived(data.tagPage.name);
	const long = $derived(name.length > 28);
	const views = $derived([
		{ label: 'Tag with notes', notes: data.worst ? many(data.recent, 24) : data.tagPage.notes },
		{ label: 'Single note', notes: data.tagPage.notes.slice(0, 1) }
	]);
</script>

<svelte:head><title>{name} · Notes Archive</title></svelte:head>

<Frame>
	{#each views as v, i (v.label)}
		<section class="card panel" aria-labelledby="tag-{i}">
			<p class="state type-overline">State {i + 1} · {v.label}</p>
			<header class="head">
				<p class="type-overline kind">Tag</p>
				<svelte:element this={i === 0 ? 'h1' : 'h2'} id="tag-{i}" class="name" class:long lang="de">{name}</svelte:element>
				<p class="card-note">{plural(v.notes.length, 'note')}</p>
			</header>
			<ul class="results" aria-label="Notes tagged {name}">
				{#each v.notes as card (card.id)}
					<NoteEntry {card} />
				{/each}
			</ul>
		</section>
	{/each}
</Frame>

<style>
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.state, .kind { color: var(--ink-muted); }
	.head { display: grid; gap: var(--space-1-5); justify-items: start; min-inline-size: 0; }
	.name {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
		overflow-wrap: anywhere;
		hyphens: auto;
		max-inline-size: 100%;
	}
	.name.long {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.results { display: grid; gap: var(--space-2); }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
