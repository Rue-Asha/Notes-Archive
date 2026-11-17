<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Icon from '../search/Icon.svelte';
	import NoteEntry from '../search/NoteEntry.svelte';
	import { many, plural } from '../search/data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const name = $derived(data.tagPage.name);
	const split = (t: string) => {
		const cut = t.trimEnd().lastIndexOf(' ');
		return cut > 0 ? [t.slice(0, cut + 1), t.slice(cut + 1)] : ['', t];
	};
	const views = $derived([
		{ label: 'Tag with notes', name, lang: 'de', notes: data.worst ? many(data.recent, 24) : data.tagPage.notes },
		{ label: 'Single note', name, lang: 'de', notes: data.tagPage.notes.slice(0, 1) },
		{ label: 'Right-to-left name, one letter and emoji', name: 'עברית 🚆 T', lang: 'he', notes: data.tagPage.notes.slice(0, 2) }
	]);
</script>

<svelte:head><title>{name} · Notes Archive</title></svelte:head>

<Frame current={null} tag>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Tag</li></ul>
			<h1 class="name" class:long={name.length > 28} lang="de" dir="auto">{split(name)[0]}<em class="accent-word">{split(name)[1]}</em></h1>
			<p class="lede">{plural(views[0].notes.length, 'note')}, newest edited first.</p>
		</div>
	</header>
	<div class="screen-body">
		{#each views as v, i (v.label)}
			<section class="card panel" aria-labelledby="tag-{i}">
				<div class="head">
					<p class="state type-overline" id="tag-{i}">State {i + 1} · {v.label}</p>
					{#if i > 0}<h2 class="sub" class:long={v.name.length > 28} lang={v.lang} dir="auto">{split(v.name)[0]}<em class="accent-word">{split(v.name)[1]}</em></h2>{/if}
					<p class="count"><Icon name="tag" size={16} /><span>{plural(v.notes.length, 'note')}</span></p>
				</div>
				<ul class="results" aria-label="Notes tagged {v.name}">
					{#each v.notes as card (card.id)}
						<NoteEntry {card} />
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</Frame>

<style>
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.state {
		color: var(--ink-secondary);
	}
	.head {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
		min-inline-size: 0;
	}
	.name,
	.sub {
		overflow-wrap: anywhere;
		hyphens: auto;
		max-inline-size: 100%;
	}
	.name.long {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.sub.long {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.count {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-variant-numeric: var(--numeric-figures);
	}
	.results {
		display: grid;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
