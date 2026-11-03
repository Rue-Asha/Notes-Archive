<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import type { MockNote } from './fixtures.ts';

	let { note }: { note: MockNote } = $props();
</script>

<a class="card note" href="#note-{note.id}" data-note-card data-morph="note-{note.id}">
	<div class="top">
		<span class="emoji" aria-hidden="true">{note.icon ?? '·'}</span>
		<span class="meta tnum">
			{#if note.pinned}<Icon name="pin" size={14} label="Pinned" />{/if}
			{note.updated}
		</span>
	</div>
	<h3>{note.title}</h3>
	<p class="snippet">{note.snippet}</p>
	<ul class="tags">
		{#each note.tags as tag (tag)}<li>{tag}</li>{/each}
	</ul>
</a>

<style>
	.note {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-block-size: 204px;
		max-inline-size: 320px;
		padding: var(--s-5);
		transition: transform var(--d-base) var(--ease-out);
	}

	.note:hover {
		transform: translateY(-2px);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.emoji {
		font-size: 26px;
		line-height: 1;
	}

	.meta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	h3 {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 420;
		letter-spacing: -0.01em;
		line-height: 1.15;
		text-wrap: balance;
	}

	.snippet {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--ink-2);
		font-size: var(--t-body);
		line-height: 1.45;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		margin-block-start: auto;
		padding-block-start: var(--s-2);
		color: var(--ink-2);
		font-size: 10.5px;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.tags li + li {
		margin-inline-start: var(--s-3);
		padding-inline-start: var(--s-3);
		border-inline-start: 1px solid var(--line);
	}
</style>
