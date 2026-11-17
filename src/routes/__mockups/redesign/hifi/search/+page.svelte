<script lang="ts">
	import NoMatch from '../ui/NoMatch.svelte';
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockCard } from '../../fixtures.ts';
	import State from '../note/State.svelte';
	import Icon from './Icon.svelte';
	import ResultRow from './ResultRow.svelte';
	import { many, plural, withTerm } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const folderLabel = $derived(data.folder.path.length ? data.folder.path.slice(0, 4).join(' / ') + (data.folder.path.length > 4 ? ' / … / ' + data.folder.path.at(-1) : '') : 'Travel / Berlin');
	const tagLabel = $derived(data.tags[0].name);
	const live = $derived<MockCard[]>(withTerm(worst ? many(data.recent, 50) : data.search.hits, data.search.query));
	const filterOnly = $derived(data.recent.slice(0, 4));

	type View = { label: string; q: string; folder: string | null; tag: string | null; results: MockCard[] };
	const views = $derived<View[]>([
		{ label: 'Query with both filters', q: data.search.query, folder: folderLabel, tag: tagLabel, results: live },
		{ label: 'Idle: no query, no filter', q: '', folder: null, tag: null, results: [] },
		{ label: 'No match for a text query', q: worst ? data.search.query : 'zebra', folder: null, tag: null, results: [] },
		{ label: 'Filter only: no results', q: '', folder: folderLabel, tag: tagLabel, results: [] },
		{ label: 'Filter only: plain snippets, last edited first', q: '', folder: folderLabel, tag: null, results: filterOnly },
		{ label: 'Mixed scripts and emoji in the query', q: '東京 עברית 🚆', folder: null, tag: null, results: [] },
		{ label: 'Single result', q: data.search.query, folder: null, tag: null, results: withTerm(data.recent.slice(0, 1), data.search.query) }
	]);
	const pad = (n: number, of: number) => String(n).padStart(Math.max(2, String(of).length), '0');
</script>

<svelte:head><title>Search · Notes Archive</title></svelte:head>

<Frame current="search">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Notes</li><li>Search</li></ul>
			<h1>Search <em class="accent-word">notes</em></h1>
			<p class="lede">Find a note by its words, its folder or its tag.</p>
		</div>
	</header>
	<div class="screen-body states">
		{#each views as v, i (v.label)}
			<State label={`State ${i + 1} · ${v.label}`}>
				<div class="finder">
					<form class="seg-bar bar" role="search" onsubmit={(e) => e.preventDefault()}>
						<label class="seg query">
							<Icon name="search" />
							<span class="sr-only">Search notes</span>
							<input type="search" value={v.q} placeholder="Search notes" dir="auto" />
						</label>
						<label class="seg filter" class:active={v.folder}>
							<Icon name="folder" />
							<span class="seg-text">
								<span class="seg-label">Folder</span>
								<select><option>{v.folder ?? 'Any folder'}</option></select>
							</span>
							<span class="chev" aria-hidden="true"><Icon name="chevronDown" size={16} /></span>
						</label>
						<label class="seg filter" class:active={v.tag}>
							<Icon name="tag" />
							<span class="seg-text">
								<span class="seg-label">Tag</span>
								<select lang="de"><option>{v.tag ?? 'Any tag'}</option></select>
							</span>
							<span class="chev" aria-hidden="true"><Icon name="chevronDown" size={16} /></span>
						</label>
					</form>

					{#if !v.q && !v.folder && !v.tag}
						<div class="card none">
							<p class="lead">Search your notes</p>
							<p class="line">Search by title, text or tag, or pick a folder or tag.</p>
						</div>
					{:else if v.results.length === 0}
						<div class="card none" role="status">
							{#if v.q}<NoMatch lead="No notes match" query={v.q} />{:else}<p class="lead">No results</p>{/if}
							<p class="line">{v.q ? 'Check the spelling, or try fewer words.' : 'No note has this tag in this folder. Try another folder or tag.'}</p>
							<p class="count" aria-live="polite">{plural(0, 'result')}</p>
						</div>
					{:else}
						<section class="card hits" aria-label="Results">
							<div class="head">
								<h3 class="ruled">Results</h3>
								<p class="count" aria-live="polite">{plural(v.results.length, 'result')}</p>
							</div>
							<ul>
								{#each v.results as card, n (card.id)}
									<ResultRow {card} query={v.q} pos={pad(n + 1, v.results.length)} />
								{/each}
							</ul>
						</section>
					{/if}
				</div>
			</State>
		{/each}
	</div>
</Frame>

<style>
	.states.screen-body { gap: var(--space-9); }
	.finder { display: grid; gap: var(--space-3); min-inline-size: 0; }

	/* one glass bar on the field: the query pill, then Folder and Tag as cells; a chosen filter is the charcoal pill */
	.bar { justify-self: stretch; flex-wrap: nowrap; gap: var(--space-1); min-inline-size: 0; padding: var(--space-1-5); }
	.bar .seg { position: relative; min-inline-size: 0; border-radius: var(--radius-pill); color: var(--ink); }
	.bar .seg > :global(svg) { flex: none; }
	.query { flex: 1 1 16rem; padding-inline: var(--space-5) var(--space-3); background: var(--surface-raised); box-shadow: var(--ring-control); }
	.query:has(input:focus-visible), .filter:has(select:focus-visible) { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.query input {
		flex: 1;
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 100%;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}
	.query input:focus-visible, .filter select:focus-visible { outline: none; }
	.query input::placeholder { color: var(--ink-muted); opacity: 1; }
	.filter { flex: 0 1 13rem; padding-inline: var(--space-4) var(--space-3); }
	.bar .filter { box-shadow: none; }
	.filter .seg-text { flex: 1; }
	.filter select {
		appearance: none;
		inline-size: 100%;
		min-inline-size: 0;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		text-overflow: ellipsis;
	}
	.chev { display: inline-flex; flex: none; color: var(--ink-secondary); pointer-events: none; }
	.filter.active { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.filter.active .chev { color: var(--ink-on-inverse-secondary); }
	.bar .filter.active > :global(svg) { color: var(--ink-on-inverse); }
	.filter.active select { color: var(--ink-on-inverse); font-weight: var(--weight-medium); }
	@media (hover: hover) {
		.filter:not(.active):hover { background: var(--surface-tint); }
		.filter.active:hover { background: var(--surface-inverse-hover); }
	}

	.hits { display: grid; gap: var(--space-2); padding: var(--space-4) var(--space-2) var(--space-2); background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; box-shadow: var(--shadow-lift); }
	.head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); padding-inline: var(--space-3-5); }
	.ruled { color: var(--ink-secondary); }
	.count { color: var(--ink-secondary); font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-variant-numeric: var(--numeric-figures); }
	.hits ul { display: grid; gap: var(--space-0-5); }

	.none { display: grid; justify-items: start; gap: var(--space-3); padding: var(--space-8) var(--space-8) var(--space-9); background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; box-shadow: var(--shadow-lift); overflow-wrap: anywhere; }
	.none .count { padding-block-start: var(--space-2); }
	.lead {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
		text-wrap: balance;
	}
	.none :global(.lead) { font-size: var(--type-display-m-size); line-height: var(--type-display-m-line); letter-spacing: var(--type-display-m-tracking); }
	.line { max-inline-size: 44ch; color: var(--ink-secondary); font-size: var(--type-body-size); line-height: var(--type-body-line); }

	/* below the wide layout the query takes the whole first row and the two filters share the second */
	@media (max-width: 1099px) {
		.bar.seg-bar { flex-wrap: wrap; row-gap: var(--space-1-5); }
		.query { flex-basis: 100%; }
		.filter { flex: 1 1 10rem; }
	}
	@media (max-width: 767px) {
		.bar.seg-bar { display: flex; padding: var(--space-1-5); border-radius: var(--radius-bar-compact); }
		.filter { flex: 1 1 8rem; padding-inline: var(--space-3) var(--space-2); }
		.none { padding: var(--space-6) var(--space-5) var(--space-7); border-radius: var(--radius-card-s); }
		.lead, .none :global(.lead) { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); }
		.hits { border-radius: var(--radius-card-s); }
	}
</style>
