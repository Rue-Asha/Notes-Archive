<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from './Icon.svelte';
	import { parts, when } from './data.ts';

	let { card, query = '', menu = true }: { card: MockCard; query?: string; menu?: boolean } = $props();
	const pieces = $derived(parts(card.snippet, query));
</script>

<li class="entry">
	<a class="open" href="/__mockups/redesign/hifi/search">
		<span class="thumb-icon" aria-hidden="true">{#if card.icon}{card.icon}{:else}<Icon name="note" size={20} />{/if}</span>
		<span class="text">
			<span class="title" title={card.title}>{card.title || 'Untitled'}</span>
			<span class="snippet">{#each pieces as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
			<span class="meta">
				<span class="where"><Icon name="folder" size={14} /><span class="folder">{card.folder}</span></span>
				<span class="when">{when(card.updated)}</span>
				{#each card.tags as tag}<span class="tag">{tag}</span>{/each}
			</span>
		</span>
	</a>
	{#if menu}<button class="more" type="button" aria-label="Note actions" aria-haspopup="menu" data-press="round"><Icon name="more" /></button>{/if}
</li>

<style>
	.entry {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-1) var(--space-1) var(--space-1);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
		min-inline-size: 0;
	}
	@media (hover: hover) {
		.entry:hover {
			background: var(--surface-tint);
		}
	}
	.open {
		display: grid;
		grid-template-columns: var(--space-10) minmax(0, 1fr);
		gap: var(--space-3);
		padding: var(--space-2-5) var(--space-2) var(--space-2-5) var(--space-2-5);
		border-radius: var(--radius-panel);
		color: inherit;
		text-decoration: none;
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
	}
	.thumb-icon {
		display: grid;
		place-items: center;
		inline-size: var(--space-10);
		block-size: var(--space-10);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
		font-size: var(--type-title-size);
		line-height: 1;
	}
	.text {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.title {
		font-weight: var(--type-title-weight);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.snippet {
		color: var(--ink-secondary);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	mark {
		background: var(--accent-soft);
		color: var(--ink);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-text);
		padding-inline: var(--space-0-5);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		min-inline-size: 0;
	}
	.where {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		flex-basis: 100%;
		min-inline-size: 0;
	}
	.where :global(svg) {
		flex: none;
	}
	.folder,
	.tag {
		overflow-wrap: anywhere;
		min-inline-size: 0;
	}
	.tag {
		padding: 0 var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink);
	}
	.more {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-secondary);
	}
	@media (hover: hover) {
		.more:hover {
			background: var(--surface-tint);
		}
	}
</style>
