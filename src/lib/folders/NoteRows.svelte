<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import CardMenu from '#lib/notes/CardMenu.svelte';
	import { shortDate } from '#lib/notes/time.ts';
	import { titleLine } from '#lib/title.ts';
	import type { NoteCard } from '#lib/types.ts';
	import { arrive, depart, reflow } from '#lib/ui/motion.ts';

	let { notes, label = 'Notes' }: { notes: NoteCard[]; label?: string } = $props();
</script>

<ul class="rows" aria-label={label} data-note-rows>
	{#each notes as note (note.id)}
		<li class="row" data-note-row animate:reflow in:arrive|global out:depart>
			{#if note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{:else}<Icon name="note" size={20} />{/if}
			<a class="stack" href="/notes/{note.id}">
				<span class="title" data-note-title>{titleLine(note.title)}</span>
				<span class="snippet">{note.snippet || COPY.emptyNote}</span>
			</a>
			<time class="meta" datetime={note.updatedAt}>{shortDate(note.updatedAt)}</time>
			<CardMenu {note} />
		</li>
	{/each}
</ul>

<style>
	.rows {
		overflow: hidden;
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--shadow-lift);
	}

	.row + .row {
		box-shadow: var(--rule-above);
	}

	.row {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		min-block-size: var(--target);
		padding: var(--space-3) var(--space-5);
	}

	.row > :global(svg),
	.emoji {
		flex: none;
		margin-block-start: var(--space-0-5);
		color: var(--ink-secondary);
	}

	.emoji {
		inline-size: 20px;
		text-align: center;
		font-size: var(--type-body-size);
		line-height: 20px;
	}

	/* the whole row is the link, so the menu button can sit above it without nesting controls; the link's own box keeps
	   the target size too, for anything that measures it */
	.stack {
		display: grid;
		flex: 1;
		align-content: center;
		min-inline-size: 0;
		min-block-size: var(--target);
		gap: var(--space-0-5);
		color: var(--ink);
		text-decoration: none;
	}

	.stack::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.title {
		display: -webkit-box;
		overflow: hidden;
		overflow-wrap: anywhere;
		hyphens: auto;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--weight-semibold);
	}

	.snippet {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		line-height: var(--type-body-s-line);
	}

	.meta {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}

	@media (hover: hover) {
		.row:hover {
			background: var(--surface-tint);
		}
	}

	.row:has(.stack:active) {
		background: var(--surface-tint-strong);
	}
</style>
