<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from '../note/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import { initial, relTime } from './data.ts';

	type Reorder = { canUp: boolean; canDown: boolean; up: () => void; down: () => void };
	type Props = {
		card: MockCard;
		pinned?: boolean;
		reorder?: Reorder | null;
		open?: boolean;
		dragging?: boolean;
		ontoggle: () => void;
		ongrip?: (e: PointerEvent) => void;
		onclose?: () => void;
	};
	let { card, pinned = false, reorder = null, open = false, dragging = false, ontoggle, ongrip, onclose }: Props = $props();

	const shown = $derived(card.tags.slice(0, 3));
	const more = $derived(card.tags.length - shown.length);
	const name = $derived(card.title || 'Untitled');

	type Item = MenuItem & { icon?: 'up' | 'down' | 'trash' };
	const items = $derived<Item[]>([
		...(reorder
			? [{ label: 'Move up', icon: 'up', disabled: !reorder.canUp }, { label: 'Move down', icon: 'down', disabled: !reorder.canDown, }]
			: []),
		{ label: pinned ? 'Unpin' : 'Pin', separator: !!reorder },
		{ label: 'Move to…' },
		{ label: 'Delete', danger: true, icon: 'trash' }
	] as Item[]);
	const onselect = (item: MenuItem) => {
		if (item.label === 'Move up') reorder?.up();
		else if (item.label === 'Move down') reorder?.down();
	};
</script>

<div class="entry" class:open class:dragging>
	{#if reorder}
		<button type="button" class="grip" tabindex="-1" aria-label="Drag to reorder" onpointerdown={ongrip}><Icon name="grip" /></button>
	{/if}
	<a class="main" href="/__mockups/redesign/hifi/note" title={name} data-hover>
		<span class="thumb plate" aria-hidden="true">{card.icon ?? initial(name)}</span>
		<span class="text">
			<span class="title">{name}</span>
			<span class="snippet">{card.snippet}</span>
			<span class="meta">
				<span class="folder">{card.folder}</span>
				{#each shown as tag (tag)}<span class="tag" title={tag}>{tag}</span>{/each}
				{#if more > 0}<span class="tag" aria-label={`${more} more tags`}>+{more}</span>{/if}
				<span class="time">{relTime(card.updated)}</span>
			</span>
		</span>
	</a>
	<button id={`menu-btn-${pinned ? 'p' : 'r'}-${card.id}`} type="button" class="menu-btn" aria-label={`Actions for ${name}`} aria-haspopup="menu" aria-expanded={open} data-press="round" onclick={ontoggle}><Icon name="more" /></button>
	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="menu" onkeydown={(e) => e.key === 'Escape' && onclose?.()}>
			<Menu name={`Actions for ${name}`} {items} {onselect}>
				{#snippet icon(item)}{#if (item as Item).icon}<Icon name={(item as Item).icon!} size={16} />{/if}{/snippet}
			</Menu>
		</div>
	{/if}
</div>

<style>
	.entry {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		column-gap: var(--space-1);
		padding: var(--space-2) var(--space-1) var(--space-2) var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
	}
	.entry.dragging { background: var(--surface-raised); box-shadow: var(--shadow-lift); }
	.grip {
		display: none;
		place-items: center;
		inline-size: var(--target);
		block-size: var(--control-height);
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink-secondary);
		cursor: grab;
		touch-action: none;
	}
	.dragging .grip { cursor: grabbing; }
	/* the grip column exists only where the grip shows; on touch the menu button keeps the second column */
	@media (hover: hover) and (pointer: fine) {
		.grip { display: grid; }
		.entry:has(.grip) { grid-template-columns: auto minmax(0, 1fr) auto; }
	}
	.main {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--space-3);
		min-inline-size: 0;
		padding: var(--space-1);
		border-radius: var(--radius-item);
		color: inherit;
		text-decoration: none;
	}
	.main :global(.thumb) { --thumb: var(--control-height); background: var(--surface-raised); box-shadow: var(--ring-hairline); }
	/* below 360 the thumb is the first thing to go: the text column needs the width more than the plate does */
	@media (max-width: 359px) {
		.main { grid-template-columns: minmax(0, 1fr); }
		.main :global(.thumb) { display: none; }
	}
	.text { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.title {
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
	.snippet {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-0-5) var(--space-2);
		margin-block-start: var(--space-1);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		min-inline-size: 0;
	}
	.folder {
		max-inline-size: 100%;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
	}
	.tag { max-inline-size: 100%; padding-inline: var(--space-2); border-radius: var(--radius-pill); background: var(--surface-tint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.time { margin-inline-start: auto; font-variant-numeric: var(--numeric-figures); }
	.menu-btn {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-secondary);
	}
	.menu-btn { grid-column: -2; }
	.open .menu-btn { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	@media (hover: hover) {
		.main:hover { background: var(--surface-tint); }
		.menu-btn:hover { background: var(--surface-tint-strong); }
		.open .menu-btn:hover { background: var(--surface-inverse-hover); }
	}
	.menu {
		position: absolute;
		z-index: var(--z-menu);
		inset-inline-end: var(--space-1);
		inset-block-start: calc(100% - var(--space-2));
		min-inline-size: 13rem;
		max-inline-size: calc(100vw - 2 * var(--space-4));
	}
</style>
