<script lang="ts">
	import { goto } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import NoteCard from '#lib/notes/NoteCard.svelte';
	import { parseQuery, searchHref } from '#lib/search/query.ts';
	import SearchFilters from '#lib/search/SearchFilters.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
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

	const searching = $derived(data.query.q.trim() !== '' || data.query.folderId != null || data.query.tagId != null);
</script>

<svelte:head><title>Search · Notes Archive</title></svelte:head>

<div class="search-page" data-search-page>
	<header>
		<Eyebrow>Search</Eyebrow>
		<form class="bar glass strong" role="search" onsubmit={submit}>
			<Icon name="search" size={20} />
			<input bind:this={field} bind:value type="search" aria-label="Search notes" placeholder="Search notes" autocomplete="off" spellcheck="false" oninput={typed} />
		</form>
		<SearchFilters tree={data.tree} tags={data.tags} folderId={data.query.folderId} tagId={data.query.tagId} onchange={filtered} />
	</header>

	{#if data.hits.length}
		<p class="count tnum">{data.hits.length} {data.hits.length === 1 ? 'result' : 'results'}</p>
		<div class="grid" data-search-results>
			{#each data.hits as hit, index (hit.note.id)}<NoteCard note={hit.note} {index} parts={hit.parts} />{/each}
		</div>
	{:else if searching}
		<p class="empty">{data.query.q.trim() ? COPY.noMatch(data.query.q.trim()) : COPY.noResults}</p>
	{:else}
		<p class="empty">Search by title, text or tag, or pick a folder or tag.</p>
	{/if}
</div>

<style>
	.search-page {
		display: grid;
		gap: var(--s-6);
	}

	header {
		display: grid;
		gap: var(--s-4);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding-inline: var(--s-5);
		border-radius: var(--r-pill);
		max-inline-size: 640px;
	}

	input {
		flex: 1;
		min-inline-size: 0;
		min-block-size: 52px;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 18px;
		outline: none;
	}

	.count,
	.empty {
		color: var(--ink-2);
		overflow-wrap: anywhere;
	}

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
