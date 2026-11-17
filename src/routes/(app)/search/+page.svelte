<script lang="ts">
	import { onDestroy } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import NoteCard from '#lib/notes/NoteCard.svelte';
	import NoMatch from '#lib/search/NoMatch.svelte';
	import { hitDisplay, parseQuery, searchHref } from '#lib/search/query.ts';
	import SearchFilters from '#lib/search/SearchFilters.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import type { Id } from '#lib/types.ts';
	import type { PageData } from './$types';

	const DEBOUNCE = 200;

	let { data }: { data: PageData } = $props();

	let field = $state<HTMLInputElement>();
	let value = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	// back and forward bring the URL's query along, unless the person is typing
	$effect(() => {
		const q = data.query.q;
		if (document.activeElement !== field) value = q;
	});

	// the address bar moves before the load and the page transition finish, so the next change builds on it, not on `data` or `page.url`
	const current = () => parseQuery(new URL(location.href).searchParams);

	const go = (href: string, replace: boolean) => goto(href, { replace, reset: false });

	// a query still waiting must not land on the page the person went to instead
	beforeNavigate(({ to }) => {
		if (to?.url.pathname !== '/search') clearTimeout(timer);
	});
	onDestroy(() => clearTimeout(timer));

	function typed() {
		clearTimeout(timer);
		timer = setTimeout(() => go(searchHref({ ...current(), q: value }), true), DEBOUNCE);
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		clearTimeout(timer);
		go(searchHref({ ...current(), q: value }), true);
	}

	function filtered(change: { folderId: Id | null } | { tagId: Id | null }) {
		go(searchHref({ ...current(), ...change }), false);
	}

	const term = $derived(data.query.q.trim());
	const searching = $derived(term !== '' || data.query.folderId != null || data.query.tagId != null);
	const count = $derived(`${data.hits.length} ${data.hits.length === 1 ? 'result' : 'results'}`);
</script>

<svelte:head><title>Search · Notes Archive</title></svelte:head>

<div class="search-page" data-search-page>
	<header class="lead">
		<ul class="kicker"><li>Notes</li><li>Search</li></ul>
		<h1>Search <em class="accent-word">notes</em></h1>
		<p class="lede">Find a note by its words, its folder or its tag.</p>
	</header>

	<form class="seg-bar bar" role="search" onsubmit={submit}>
		<label class="seg query">
			<Icon name="search" size={20} />
			<input bind:this={field} bind:value type="search" aria-label="Search notes" placeholder="Search notes" dir="auto" autocomplete="off" spellcheck="false" oninput={typed} />
		</label>
		<SearchFilters tree={data.tree} tags={data.tags} folderId={data.query.folderId} tagId={data.query.tagId} onchange={filtered} />
	</form>

	{#if data.hits.length}
		<section class="card hits" aria-labelledby="search-results">
			<div class="head">
				<h2 class="ruled" id="search-results">Results</h2>
				<p class="count figures" aria-live="polite">{count}</p>
			</div>
			<ul class="results" data-search-results>
				{#each data.hits as hit, i (hit.note.id)}{@const shown = hitDisplay(hit, hit.note.title.trim() || COPY.untitled)}<li><NoteCard note={hit.note} parts={shown.snippet ?? undefined} titleParts={shown.title} index={i} /></li>{/each}
			</ul>
		</section>
	{:else if searching}
		<div class="card none">
			{#if term}
				<NoMatch query={term} />
				<p class="line">Check the spelling, or try fewer words.</p>
			{:else}
				<p class="status lead-text" role="status">{COPY.noResults}</p>
				<p class="line">Try another folder or tag.</p>
			{/if}
		</div>
	{:else}
		<div class="card none">
			<p class="lead-text">Search your notes</p>
			<p class="line">Search by title, text or tag, or pick a folder or tag.</p>
		</div>
	{/if}
</div>

<style>
	.search-page {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
	}

	.lead {
		display: grid;
		gap: var(--space-4);
		justify-items: start;
		min-inline-size: 0;
	}

	h1 {
		overflow-wrap: anywhere;
	}

	/* one glass bar: the query pill first, then Folder and Tag as cells; a chosen filter is the charcoal pill */
	.bar.seg-bar {
		display: flex;
		justify-self: stretch;
		flex-wrap: wrap;
		gap: var(--space-1);
		row-gap: var(--space-1-5);
		padding: var(--space-1-5);
		min-inline-size: 0;
	}

	.query {
		flex: 1 1 100%;
		min-inline-size: 0;
		padding-inline: var(--space-5) var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
	}

	@media (min-width: 1100px) {
		.query {
			flex-basis: 16rem;
		}
	}

	.query:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	input {
		flex: 1;
		inline-size: 100%;
		min-inline-size: 0;
		block-size: 100%;
		min-block-size: var(--target);
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}

	input:focus-visible {
		outline: none;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.hits {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-2) var(--space-2);
		min-inline-size: 0;
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--space-3-5);
	}

	.count {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}

	.results {
		display: grid;
		gap: var(--space-2);
	}

	li {
		min-inline-size: 0;
	}

	.none {
		display: grid;
		justify-items: start;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-8) var(--space-9);
		overflow-wrap: anywhere;
		min-inline-size: 0;
	}

	.lead-text {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
		text-wrap: balance;
	}

	.none :global(.lead) {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}

	.line {
		max-inline-size: 44ch;
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	@media (max-width: 767px) {
		.none {
			padding: var(--space-6) var(--space-5) var(--space-7);
		}

		.lead-text,
		.none :global(.lead) {
			font-size: var(--type-display-s-size);
			line-height: var(--type-display-s-line);
			letter-spacing: var(--type-display-s-tracking);
		}
	}
</style>
