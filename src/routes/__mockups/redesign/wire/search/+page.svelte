<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockCard } from '../../fixtures.ts';
	import NoteEntry from './NoteEntry.svelte';
	import { many, plural, withTerm } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const folderLabel = $derived(data.folder.path.length ? data.folder.path.slice(0, 4).join(' / ') + (data.folder.path.length > 4 ? ' / … / ' + data.folder.path.at(-1) : '') : 'Travel / Berlin');
	const tagLabel = $derived(data.tags[0].name);
	const live = $derived<MockCard[]>(withTerm(worst ? many(data.recent, 50) : data.search.hits, data.search.query));
	const filterOnly = $derived(data.recent.slice(0, 4).map((c) => ({ ...c, snippet: c.snippet })));

	type View = { label: string; q: string; folder: string | null; tag: string | null; results: MockCard[] };
	const views = $derived<View[]>([
		{ label: 'Query with both filters', q: data.search.query, folder: folderLabel, tag: tagLabel, results: live },
		{ label: 'Idle: no query, no filter', q: '', folder: null, tag: null, results: [] },
		{ label: 'No match for a text query', q: worst ? data.search.query : 'zebra', folder: null, tag: null, results: [] },
		{ label: 'Filter only: no results', q: '', folder: folderLabel, tag: tagLabel, results: [] },
		{ label: 'Filter only: plain snippets, last edited first', q: '', folder: folderLabel, tag: null, results: filterOnly },
		{ label: 'Single result', q: data.search.query, folder: null, tag: null, results: withTerm(data.recent.slice(0, 1), data.search.query) }
	]);
</script>

<svelte:head><title>Search · Notes Archive</title></svelte:head>

<Frame>
	{#each views as v, i (v.label)}
		<section class="card panel" aria-labelledby="state-{i}">
			<p class="state type-overline" id="state-{i}">State {i + 1} · {v.label}</p>
			<div class="card-head">
				{#if i === 0}<h1 class="type-display-m">Search</h1>{:else}<h2 class="type-display-s">Search</h2>{/if}
				{#if v.q || v.folder || v.tag}<p class="card-note">{plural(v.results.length, 'result')}</p>{/if}
			</div>

			<form class="controls" role="search" onsubmit={(e) => e.preventDefault()}>
				<label class="field">
					<span class="label type-label">Search notes</span>
					<input type="search" value={v.q} placeholder="Search notes" />
				</label>
				<div class="filters">
					<label class="field">
						<span class="label type-label">Folder</span>
						<span class="select">
							<select aria-label="Folder"><option>{v.folder ?? 'Any folder'}</option></select>
							<span class="chev" aria-hidden="true">⌄</span>
						</span>
					</label>
					<label class="field">
						<span class="label type-label">Tag</span>
						<span class="select">
							<select aria-label="Tag"><option>{v.tag ?? 'Any tag'}</option></select>
							<span class="chev" aria-hidden="true">⌄</span>
						</span>
					</label>
				</div>
			</form>

			{#if !v.q && !v.folder && !v.tag}
				<p class="empty">Search by title, text or tag, or pick a folder or tag.</p>
			{:else if v.results.length === 0}
				<p class="empty" role="status">{v.q ? `No notes match “${v.q}”` : 'No results'}</p>
			{:else}
				<ul class="results" aria-label="Results">
					{#each v.results as card (card.id)}
						<NoteEntry {card} query={v.q} />
					{/each}
				</ul>
			{/if}
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
	.state {
		color: var(--ink-muted);
	}
	.controls { display: grid; gap: var(--space-3); }
	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: var(--space-3);
	}
	.field { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.label { color: var(--ink-secondary); }
	input,
	select {
		inline-size: 100%;
		min-inline-size: 0;
		block-size: var(--control-height);
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		text-overflow: ellipsis;
	}
	select {
		appearance: none;
		padding-inline-end: var(--space-10);
	}
	.select { position: relative; display: block; min-inline-size: 0; }
	.chev {
		position: absolute;
		inset-inline-end: var(--space-4);
		inset-block-start: 50%;
		translate: 0 -55%;
		pointer-events: none;
		color: var(--ink-secondary);
	}
	.results { display: grid; gap: var(--space-2); }
	.empty {
		padding: var(--space-8) var(--space-4);
		text-align: center;
		color: var(--ink-secondary);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		overflow-wrap: anywhere;
	}
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
