<script lang="ts">
	import { tick } from 'svelte';
	import type { SuggestionProps } from '@tiptap/suggestion';
	import { COPY } from '#lib/copy.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { SlashItem } from './context.ts';
	import { placeFloating, watchViewport } from './floating.ts';

	type Props = SuggestionProps<SlashItem, SlashItem>;

	let open = $state(false);
	let items = $state.raw<SlashItem[]>([]);
	let command = $state.raw<Props['command']>(() => {});
	let selected = $state(0);
	let list = $state<HTMLDivElement>();
	let anchor = $state.raw<(() => DOMRect | null) | null>(null);
	let query = $state('');

	const pad = (n: number) => String(n).padStart(String(items.length).length, '0');

	function place() {
		const rect = anchor?.();
		if (rect && list) placeFloating(list, rect);
	}

	$effect(() => {
		if (!open) return;
		void items;
		void anchor;
		place();
		return watchViewport(place);
	});

	export function show(props: Props) {
		items = props.items;
		command = props.command;
		selected = 0;
		query = props.query;
		anchor = props.clientRect ?? null;
		open = true;
	}

	export function update(props: Props) {
		items = props.items;
		command = props.command;
		selected = Math.min(selected, Math.max(0, items.length - 1));
		query = props.query;
		anchor = props.clientRect ?? null;
	}

	export function hide() {
		open = false;
	}

	export function key(event: KeyboardEvent): boolean {
		if (!open || !items.length) return false;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
			tick().then(() => list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
			return true;
		}
		if (event.key === 'Enter' || event.key === 'Tab') {
			command(items[selected]);
			return true;
		}
		return false;
	}
</script>

{#if open}
	<div class="slash" bind:this={list}>
		<div class="head">
			<ul class="kicker"><li>Blocks</li><li>{query ? `“${query}”` : 'All'}</li></ul>
			{#if items.length}
				<span class="position"><span class="sr-only">Block </span>{pad(selected + 1)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true">{' / '}</span>{pad(items.length)}</span></span>
			{/if}
		</div>
		<div class="menu" role="listbox" aria-label="Blocks">
			{#each items as item, i (item.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- keys go through the editor, which keeps focus -->
				<div
					class="opt"
					role="option"
					aria-selected={i === selected}
					tabindex="-1"
					onmousedown={(e) => e.preventDefault()}
					onclick={() => command(item)}
				>
					<span class="pos" aria-hidden="true">{pad(i + 1)}</span>
					<span class="label">{item.label}</span>
					{#if i === selected}<span class="circle" aria-hidden="true"><Icon name="arrow-right" size={14} /></span>{/if}
				</div>
			{:else}
				<p class="none">{COPY.noResults}</p>
			{/each}
		</div>
	</div>
{/if}

<style>
	.slash {
		position: fixed;
		z-index: var(--z-menu);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		inline-size: 21rem;
		max-inline-size: calc(100vw - 16px);
		/* about eight rows, then the list scrolls (the signed hi-fi) */
		max-block-size: min(26rem, 100dvh - var(--space-4));
		padding: var(--space-3) var(--space-2) var(--space-2);
		border-radius: var(--radius-card-s);
		/* solid: it floats over the text it sits next to, and a glass fill lets that text show through */
		background: var(--surface-raised);
		box-shadow: var(--elevation-card);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--space-3);
	}

	.menu {
		display: grid;
		gap: var(--space-0-5);
		min-block-size: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: var(--space-1);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
	}

	.opt {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3) var(--space-1-5);
		border-radius: var(--radius-pill);
		color: var(--ink);
	}

	.pos {
		flex: none;
		min-inline-size: 2ch;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
		letter-spacing: 0.06em;
	}

	.label {
		flex: 1;
		min-inline-size: 0;
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.opt[aria-selected='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.opt[aria-selected='true'] .pos {
		color: var(--ink-on-inverse-secondary);
	}

	.circle {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: var(--space-7);
		block-size: var(--space-7);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}

	@media (hover: hover) {
		.opt:not([aria-selected='true']):hover {
			background: var(--surface-sunken);
		}
	}

	.none {
		margin: 0;
		padding: var(--space-4) var(--space-3);
		color: var(--ink-secondary);
	}
</style>
