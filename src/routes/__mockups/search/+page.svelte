<script lang="ts">
	import { page } from '$app/state';
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockHome from '#lib/mockups/MockHome.svelte';
	import MockShell from '#lib/mockups/MockShell.svelte';
	import { notes, recentSearches, searchResults } from '#lib/mockups/fixtures.ts';

	const recentState = $derived(page.url.searchParams.get('state') === 'recent');
	const query = $derived(recentState ? '' : 'garden');
</script>

<svelte:head><title>Search · Notes Archive mockups</title></svelte:head>

<div data-screen="search">
	<MockShell active="search"><MockHome /></MockShell>

	<div class="scrim"></div>
	<GlassPanel as="div" strong class="palette" data-palette role="dialog" aria-label="Search">
		<div class="input">
			<Icon name="search" size={20} />
			<span class="query">{query}{#if !recentState}<span class="caret"></span>{:else}<span class="placeholder">Search notes</span>{/if}</span>
			<kbd>Esc</kbd>
		</div>

		<div class="list">
			{#if recentState}
				<p class="eyebrow">Recent searches</p>
				{#each recentSearches as term, i (term)}
					<div class="row" class:selected={i === 0} data-recent-search>
						<Icon name="search" size={18} /><span class="title">{term}</span><Icon name="arrow-right" size={16} />
					</div>
				{/each}
				<p class="eyebrow">Recently opened</p>
				{#each notes.slice(0, 2) as note (note.id)}
					<div class="row"><span class="emoji" aria-hidden="true">{note.icon}</span><span class="title">{note.title}</span><span class="path">{note.updated}</span></div>
				{/each}
			{:else}
				<p class="eyebrow tnum">Notes · 3 results</p>
				{#each searchResults as result, i (result.title)}
					<div class="row result" class:selected={i === 0} data-result>
						<span class="emoji" aria-hidden="true">{result.icon}</span>
						<span class="text">
							<span class="title">{result.title}</span>
							<span class="snippet">{result.before}<mark>{result.hit}</mark>{result.after}</span>
						</span>
						<span class="path">{result.folder}</span>
					</div>
				{/each}
			{/if}

			<p class="eyebrow">Actions</p>
			<div class="row" data-action><Icon name="plus" size={18} /><span class="title">New note</span><kbd>⌘N</kbd></div>
			<div class="row" data-action><Icon name="folder" size={18} /><span class="title">New folder</span></div>
		</div>

		{#if !recentState}
			<div class="foot"><span>See all results</span><kbd>↵</kbd></div>
		{/if}
	</GlassPanel>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: var(--veil);
		backdrop-filter: var(--veil-filter);
	}

	:global(.palette) {
		position: fixed;
		z-index: 50;
		inset-inline: var(--s-4);
		inset-block-start: 12dvh;
		max-inline-size: 640px;
		margin-inline: auto;
		overflow: hidden;
		border-radius: var(--r-2xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
	}

	@media (max-width: 767px) {
		:global(.palette) {
			inset: 0;
			max-inline-size: none;
			border-radius: 0;
			padding-block-start: env(safe-area-inset-top);
		}
	}

	.input {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-5) var(--s-6);
		border-block-end: 1px solid var(--line);
		font-size: 18px;
	}

	.query {
		flex: 1;
		font-weight: 500;
	}

	.placeholder {
		color: var(--ink-2);
		font-weight: 400;
	}

	.caret {
		display: inline-block;
		inline-size: 2px;
		block-size: 1.1em;
		margin-inline-start: 1px;
		vertical-align: text-bottom;
		background: var(--accent);
	}

	kbd {
		padding: 2px var(--s-2);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--chip-bg);
		font: inherit;
		font-size: 12px;
		color: var(--ink-2);
	}

	.list {
		display: grid;
		gap: 2px;
		padding: var(--s-3);
	}

	.eyebrow {
		padding: var(--s-3) var(--s-3) var(--s-1);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-3);
		border: 1px solid transparent;
		border-radius: var(--r-lg);
	}

	.row.selected {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
	}

	.emoji {
		font-size: 22px;
		line-height: 1;
	}

	.text {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		gap: 2px;
	}

	.title {
		flex: 1;
		font-weight: 600;
	}

	.text .title {
		flex: none;
	}

	.snippet {
		color: var(--ink-2);
		font-size: var(--t-small);
		line-height: 1.4;
	}

	mark {
		padding: 0 2px;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--ink);
		font-weight: 600;
	}

	.path {
		align-self: flex-start;
		color: var(--ink-2);
		font-size: 12px;
		white-space: nowrap;
	}

	@media (max-width: 767px) {
		.path {
			display: none;
		}
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--s-3) var(--s-6);
		border-block-start: 1px solid var(--line);
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 600;
	}
</style>
