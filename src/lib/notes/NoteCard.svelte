<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { noteName, reveal, stagger } from '#lib/motion.ts';
	import type { NoteCard, SnippetPart } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import CardMenu from './CardMenu.svelte';
	import { relativeTime } from './time.ts';

	let { note, index = 0, parts }: { note: NoteCard; index?: number; parts?: SnippetPart[] } = $props();

	const MAX_TAGS = 3;
	const shown = $derived(note.tags.slice(0, MAX_TAGS));
	const hidden = $derived(note.tags.length - shown.length);
</script>

<article class="card note" data-note-card data-morph={noteName(note.id)} use:reveal={{ delay: stagger(index) }}>
	<span class="glow" data-card-glow aria-hidden="true"></span>
	<div class="top">
		{#if note.icon}<span class="emoji" data-card-icon aria-hidden="true">{note.icon}</span>{/if}
		<span class="meta tnum">
			{#if note.pinned}<span data-card-pin><Icon name="pin" size={14} label="Pinned" /></span>{/if}
			<time datetime={note.updatedAt} data-card-time>{relativeTime(note.updatedAt)}</time>
		</span>
		<CardMenu {note} />
	</div>
	<h3 data-card-title><a class="open" href="/notes/{note.id}">{note.title.trim() || COPY.untitled}</a></h3>
	<p class="snippet" data-card-snippet>
		{#if parts?.length}
			{#each parts as part, i (i)}{#if part.hit}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}
		{:else}
			{note.snippet || COPY.emptyNote}
		{/if}
	</p>
	{#if note.tags.length}
		<ul class="tags">
			{#each shown as tag (tag.id)}<li data-card-tag>{tag.name}</li>{/each}
			{#if hidden > 0}<li data-card-more-tags>+{hidden}</li>{/if}
		</ul>
	{/if}
</article>

<style>
	.note {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-block-size: 204px;
		padding: var(--s-5);
		isolation: isolate;
	}

	/* a soft accent wash behind the content; only its opacity animates, and only where there is a hovering pointer */
	.glow {
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		background: radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--d-base) var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.note:hover .glow {
			opacity: 1;
		}
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-block-size: 26px;
	}

	.emoji {
		font-size: 26px;
		line-height: 1;
	}

	.meta {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		margin-inline-start: auto;
		margin-inline-end: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	h3 {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 420;
		letter-spacing: -0.01em;
		line-height: 1.15;
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	/* the whole card is the link, so the menu button can sit above it without nesting interactive elements */
	.open {
		color: inherit;
		text-decoration: none;
	}

	.open::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.snippet {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
		color: var(--ink-2);
		font-size: var(--t-body);
		line-height: 1.45;
	}

	mark {
		background: var(--accent-soft);
		color: var(--ink);
		border-radius: 3px;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-1) 0;
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
