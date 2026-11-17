<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from '../note/Icon.svelte';
	import { relTime } from './data.ts';

	type Props = {
		card: MockCard;
		pinned?: boolean;
		reorder?: { canUp: boolean; canDown: boolean; up: () => void; down: () => void } | null;
		open?: boolean;
		ontoggle: () => void;
	};
	let { card, pinned = false, reorder = null, open = false, ontoggle }: Props = $props();

	const shown = $derived(card.tags.slice(0, 3));
	const more = $derived(card.tags.length - shown.length);
</script>

<li class="entry" class:open>
	{#if reorder}
		<span class="grip" aria-hidden="true"><Icon name="grip" /></span>
	{/if}
	<a class="main" href="/__mockups/redesign/wire/note" title={card.title}>
		<span class="icon" aria-hidden="true">{card.icon ?? ''}</span>
		<span class="text">
			<span class="title">{card.title}</span>
			<span class="snippet">{card.snippet}</span>
			<span class="meta">
				<span class="folder">{card.folder}</span>
				{#each shown as tag (tag)}<span class="tag">{tag}</span>{/each}
				{#if more > 0}<span class="tag">+{more}</span>{/if}
				<span class="time">{relTime(card.updated)}</span>
			</span>
		</span>
	</a>
	<button type="button" class="w-icon menu-btn" aria-label="Note actions" aria-haspopup="menu" aria-expanded={open} onclick={ontoggle}><Icon name="dots" /></button>
	{#if open}
		<ul class="w-menu" role="menu" aria-label="Note actions">
			{#if reorder}
				<li role="none"><button type="button" role="menuitem" disabled={!reorder.canUp} onclick={reorder.up}>Move up</button></li>
				<li role="none"><button type="button" role="menuitem" disabled={!reorder.canDown} onclick={reorder.down}>Move down</button></li>
				<li class="rule" role="separator"></li>
			{/if}
			<li role="none"><button type="button" role="menuitem">{pinned ? 'Unpin' : 'Pin'}</button></li>
			<li role="none"><button type="button" role="menuitem">Move to…</button></li>
			<li role="none"><button type="button" role="menuitem">Delete</button></li>
		</ul>
	{/if}
</li>

<style>
	.entry { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; column-gap: var(--space-1); padding-block: var(--space-3); box-shadow: var(--rule-above); }
	.entry:first-child { box-shadow: none; padding-block-start: 0; }
	.entry:not(:has(.grip)) { grid-template-columns: minmax(0, 1fr) auto; }
	.grip { display: none; place-items: center; inline-size: var(--target); block-size: var(--control-height-s); color: var(--ink-muted); cursor: grab; }
	@media (hover: hover) and (pointer: fine) and (min-width: 700px) { .grip { display: grid; } }
	.entry:not(:has(.grip)) .menu-btn { grid-column: 2; }
	.main { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-3); min-inline-size: 0; text-decoration: none; padding-block: var(--space-1); }
	.icon { inline-size: var(--space-6); text-align: center; line-height: var(--type-title-line); font-size: var(--type-body-size); }
	.text { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.title { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.snippet { color: var(--ink-secondary); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-0-5) var(--space-2); margin-block-start: var(--space-0-5); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); min-inline-size: 0; }
	.folder { max-inline-size: 100%; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; line-clamp: 1; overflow: hidden; }
	.tag { padding-inline: var(--space-1-5); border-radius: var(--radius-pill); background: var(--surface-tint); max-inline-size: 100%; overflow-wrap: anywhere; }
	.time { margin-inline-start: auto; font-variant-numeric: var(--numeric-figures); }
	.menu-btn { margin-block-start: var(--space-0-5); }
	.w-menu { position: absolute; inset-inline-end: 0; inset-block-start: calc(100% - var(--space-3)); }
	.rule { list-style: none; }
</style>
