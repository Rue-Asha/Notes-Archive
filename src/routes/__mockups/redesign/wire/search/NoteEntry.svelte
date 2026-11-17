<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import { parts, when } from './data.ts';

	let { card, query = '', menu = true }: { card: MockCard; query?: string; menu?: boolean } = $props();
	const pieces = $derived(parts(card.snippet, query));
</script>

<li class="entry">
	<a class="open" href="/__mockups/redesign/search">
		<span class="icon" aria-hidden="true">{card.icon ?? ''}</span>
		<span class="text">
			<span class="title" title={card.title}>{card.title || 'Untitled'}</span>
			<span class="snippet">{#each pieces as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
			<span class="meta">
				<span class="folder">{card.folder}</span>
				<span class="when">{when(card.updated)}</span>
				{#each card.tags as tag}<span class="tag">{tag}</span>{/each}
			</span>
		</span>
	</a>
	{#if menu}<button class="more" type="button" aria-label="Note actions" aria-haspopup="menu"><span aria-hidden="true">⋯</span></button>{/if}
</li>

<style>
	.entry {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	.open {
		display: grid;
		grid-template-columns: var(--space-6) minmax(0, 1fr);
		gap: var(--space-3);
		color: inherit;
		text-decoration: none;
		min-inline-size: 0;
		min-block-size: var(--target);
	}
	.icon {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		text-align: center;
	}
	.text { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.title {
		font-weight: var(--weight-semibold);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
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
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}
	mark {
		background: var(--surface-tint-strong);
		color: var(--ink);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-text);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-2);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-muted);
		min-inline-size: 0;
	}
	.folder, .tag { overflow-wrap: anywhere; min-inline-size: 0; }
	.folder { flex-basis: 100%; }
	.tag {
		padding: 0 var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink-secondary);
	}
	.more {
		display: grid;
		place-items: center;
		inline-size: var(--target);
		block-size: var(--target);
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
	}
</style>
