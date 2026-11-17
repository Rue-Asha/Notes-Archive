<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from './Icon.svelte';
	import { parts, when } from './data.ts';

	let { card, query = '', pos }: { card: MockCard; query?: string; pos: string } = $props();
	const pieces = $derived(parts(card.snippet, query));
	const tags = $derived(card.tags.slice(0, 3));
	const more = $derived(card.tags.length - tags.length);
</script>

<li class="row">
	<a class="open" href="/__mockups/redesign/hifi/note">
		<span class="pos" aria-hidden="true">{pos}</span>
		<span class="stack">
			<span class="title" title={card.title}>{#if card.icon}<span class="emoji" aria-hidden="true">{card.icon}</span>{/if}{card.title || 'Untitled'}</span>
			<span class="snippet">{#each pieces as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
			<span class="meta">
				<span class="where"><Icon name="folder" size={14} /><span class="folder" lang="de">{card.folder}</span></span>
				<span class="when">{when(card.updated)}</span>
				{#each tags as tag}<span class="tag" lang="de">{tag}</span>{/each}
				{#if more > 0}<span class="tag" aria-label="{more} more tags">+{more}</span>{/if}
			</span>
		</span>
	</a>
	<button class="more" type="button" aria-label="Actions for {card.title || 'Untitled'}" aria-haspopup="menu" data-press="round"><Icon name="more" /></button>
</li>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-1);
		border-radius: var(--radius-panel);
		min-inline-size: 0;
	}
	@media (hover: hover) {
		.row:hover { background: var(--surface-sunken); }
	}
	.open {
		display: grid;
		grid-template-columns: 2.5ch minmax(0, 1fr);
		gap: var(--space-3);
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-2-5) var(--space-1) var(--space-2-5) var(--space-3-5);
		border-radius: var(--radius-panel);
		color: inherit;
		text-decoration: none;
	}
	.pos { font-size: var(--type-caption-size); line-height: var(--type-title-line); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); letter-spacing: 0.06em; }
	.stack { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.title {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.emoji { margin-inline-end: var(--space-1-5); }
	.snippet {
		color: var(--ink-secondary);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	mark { background: var(--accent-soft); color: var(--ink); font-weight: var(--weight-semibold); border-radius: var(--radius-text); padding-inline: var(--space-0-5); }
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		min-inline-size: 0;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}
	.where { display: inline-flex; align-items: center; gap: var(--space-1); min-inline-size: 0; max-inline-size: 100%; }
	.where :global(svg) { flex: none; }
	.folder, .tag { min-inline-size: 0; overflow-wrap: anywhere; hyphens: auto; }
	.tag { max-inline-size: 100%; padding-inline: var(--space-2); border-radius: var(--radius-pill); background: var(--surface-tint); color: var(--ink); }
	.more {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		margin: var(--space-1);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-control-solid);
		color: var(--ink);
	}
	@media (hover: hover) {
		.more:hover { background: var(--surface-control-solid-hover); }
	}
</style>
