<script lang="ts">
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import { folderName } from '#lib/home/folderName.ts';
	import type { Reorder } from '#lib/home/pinned.ts';
	import type { NoteCard, SnippetPart, Tree } from '#lib/types.ts';
	import Highlight from '#lib/search/Highlight.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import CardMenu from './CardMenu.svelte';
	import { dayDate, relativeTime } from './time.ts';

	type Props = {
		note: NoteCard;
		parts?: SnippetPart[];
		titleParts?: SnippetPart[] | null;
		home?: boolean;
		reorder?: Reorder | null;
		dragging?: boolean;
		ongrip?: (event: PointerEvent) => void;
		// a search hit: its rank stands where the plate is, as a numbered list row
		index?: number;
		// a tag page entry (hi-fi): the folder on a line of its own, then the date and the tags
		tagged?: boolean;
	};
	let { note, parts, titleParts = null, home = false, reorder = null, dragging = false, ongrip, index, tagged = false }: Props = $props();

	const hit = $derived(index !== undefined);
	// search hits and tag entries share the long meta: folder with its icon, the absolute date, tags that wrap
	const long = $derived(hit || tagged);

	// a card's one meta line holds the first tag and "+N" for the rest, so the pills never run into the time; a search
	// hit's meta wraps and shows three
	const shown = $derived(note.tags.slice(0, long ? 3 : 1));
	const hidden = $derived(note.tags.length - shown.length);
	const title = $derived(note.title.trim() || COPY.untitled);
	const folder = $derived(home || long ? folderName((page.data.tree as Tree | undefined)?.folders ?? [], note.folderId) : null);
</script>

<article class="entry" class:dragging class:hit class:long class:tagged data-note-card>
	{#if reorder}
		<button type="button" class="grip" tabindex="-1" aria-label="Drag to reorder" onpointerdown={ongrip}><Icon name="grip" size={18} /></button>
	{/if}
	{#if hit}
		<span class="pos" aria-hidden="true">{String((index ?? 0) + 1).padStart(2, '0')}</span>
	{:else}
		<span class="thumb plate" aria-hidden="true" data-card-icon>{note.icon ?? Array.from(title)[0]?.toUpperCase()}</span>
	{/if}
	<div class="text">
		<h3 data-card-title><a class="open" href="/notes/{note.id}" data-hover>{#if hit && note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{/if}{#if titleParts}<Highlight parts={titleParts} />{:else}{title}{/if}</a></h3>
		<p class="snippet" data-card-snippet>
			{#if parts?.length}
				<Highlight {parts} />
			{:else}
				{note.snippet || COPY.emptyNote}
			{/if}
		</p>
		<div class="meta">
			{#if folder}<span class="folder" data-card-folder>{#if long}<Icon name="folder" size={14} />{/if}{folder}</span>{/if}
			{#if long}<time class="when" datetime={note.updatedAt} data-card-time>{dayDate(note.updatedAt)}</time>{/if}
			{#if note.tags.length}
				<ul class="tags">
					{#each shown as tag (tag.id)}<li class="tag" title={tag.name} data-card-tag>{tag.name}</li>{/each}
					{#if hidden > 0}<li class="tag more" aria-label="{hidden} more tags" data-card-more-tags>+{hidden}</li>{/if}
				</ul>
			{/if}
			{#if !long}<time class="time" datetime={note.updatedAt} data-card-time>{relativeTime(note.updatedAt)}</time>{/if}
		</div>
	</div>
	<CardMenu {note} {reorder} />
</article>

<style>
	.entry {
		position: relative;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
		column-gap: var(--space-3);
		padding: var(--space-3) var(--space-1) var(--space-3) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}

	/* a search hit is a row in the results card, not a card of its own: rank, then the text */
	.entry.hit {
		padding-inline-start: var(--space-3-5);
		background: none;
		box-shadow: none;
	}

	.pos {
		min-inline-size: 2.5ch;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-title-line);
		letter-spacing: var(--type-overline-tracking);
		font-variant-numeric: var(--numeric-figures);
	}

	.emoji {
		margin-inline-end: var(--space-1-5);
	}

	.long .folder {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		max-inline-size: 100%;
	}

	.long .folder :global(svg) {
		flex: none;
	}

	/* the long meta wraps instead of cutting its tags short, as in the hi-fi */
	.long .meta {
		flex-wrap: wrap;
		row-gap: var(--space-1);
	}

	/* on a tag page the folder takes its own line, the date and the tags the next */
	.tagged .folder {
		flex-basis: 100%;
	}

	.entry.dragging {
		box-shadow: var(--shadow-lift);
	}

	.grip {
		position: relative;
		z-index: 1;
		display: none;
		place-items: center;
		inline-size: var(--target);
		block-size: var(--control-height);
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink-muted);
		cursor: grab;
		touch-action: none;
	}

	.dragging .grip {
		cursor: grabbing;
	}

	/* the handle is for pointers; touch and keyboard use Move up / Move down in the menu */
	@media (hover: hover) and (pointer: fine) and (min-width: 768px) {
		.grip {
			display: grid;
		}

		.entry:has(.grip) {
			grid-template-columns: auto auto minmax(0, 1fr) auto;
			padding-inline-start: var(--space-1);
		}
	}

	.thumb {
		--thumb: var(--control-height);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}

	/* below 360 the text column needs the width more than the plate does */
	@media (max-width: 359px) {
		.thumb {
			display: none;
		}

		.entry,
		.entry:has(.grip) {
			grid-template-columns: minmax(0, 1fr) auto;
			padding-inline-start: var(--space-3);
		}
	}

	.text {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	h3 {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	/* the whole entry is the link, so the menu button can sit above it without nesting interactive elements */
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

	@media (hover: hover) {
		.entry:has(.open:hover) {
			background: var(--surface-tint);
		}
	}

	/* press: the entry darkens under the finger or the pointer, touch included */
	.entry:has(.open:active) {
		background: var(--surface-tint-strong);
	}

	.snippet {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		overflow-wrap: anywhere;
		color: var(--ink-secondary);
	}

	/* one line: in a narrow column the tags shrink with an ellipsis, so the date never drops to a line of its own */
	.meta {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: var(--space-0-5) var(--space-2);
		margin-block-start: var(--space-1);
		min-inline-size: 0;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	/* in a narrow column the folder gives way first, then the tag; the time and "+n" never do */
	.folder {
		flex: 0 4 auto;
		min-inline-size: 2.5em;
		max-inline-size: 40%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tags {
		display: flex;
		flex: 0 1 auto;
		gap: var(--space-2);
		min-inline-size: min-content;
		overflow: hidden;
	}

	.tag {
		flex: 0 1 auto;
		min-inline-size: 3em;
		padding-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* a tag's own width must not count toward the list's min-content, or one long word keeps the list (and the card's meta line) from shrinking */
	.tag:not(.more) {
		contain: inline-size;
	}

	.tag.more {
		flex: none;
		min-inline-size: 0;
		font-variant-numeric: var(--numeric-figures);
	}

	/* the long meta's pills wrap inside the entry: a long tag name breaks onto more lines instead of running past it */
	.long .tags {
		flex-wrap: wrap;
		row-gap: var(--space-1);
		min-inline-size: 0;
		max-inline-size: 100%;
	}

	.long .tag {
		contain: none;
		min-inline-size: 0;
		max-inline-size: 100%;
		overflow-wrap: anywhere;
		hyphens: auto;
		white-space: normal;
	}

	/* the row menu as in the hi-fi: a round solid button on a search row, an ink glyph on a tag entry */
	.hit > :global(.more) {
		background: var(--surface-control-solid);
		color: var(--ink);
	}

	.tagged > :global(.more) {
		color: var(--ink-secondary);
	}

	@media (hover: hover) {
		.hit > :global(.more:hover) {
			background: var(--surface-control-solid-hover);
		}
	}

	.when {
		flex: none;
		white-space: nowrap;
		font-variant-numeric: var(--numeric-figures);
	}

	.time {
		flex: none;
		margin-inline-start: auto;
		white-space: nowrap;
		font-variant-numeric: var(--numeric-figures);
	}
</style>
