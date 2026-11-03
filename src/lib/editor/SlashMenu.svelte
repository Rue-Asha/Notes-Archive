<script lang="ts">
	import { tick } from 'svelte';
	import type { SuggestionProps } from '@tiptap/suggestion';
	import { COPY } from '#lib/copy.ts';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import Icon, { type IconName } from '#lib/ui/Icon.svelte';
	import type { SlashItem } from './context.ts';
	import { placeFloating, watchViewport } from './floating.ts';

	type Props = SuggestionProps<SlashItem, SlashItem>;

	let open = $state(false);
	let items = $state.raw<SlashItem[]>([]);
	let command = $state.raw<Props['command']>(() => {});
	let selected = $state(0);
	let list = $state<HTMLDivElement>();
	let anchor = $state.raw<(() => DOMRect | null) | null>(null);

	const glyph = (icon: string) => !/^[a-z-]{4,}$/.test(icon);

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
		anchor = props.clientRect ?? null;
		open = true;
	}

	export function update(props: Props) {
		items = props.items;
		command = props.command;
		selected = Math.min(selected, Math.max(0, items.length - 1));
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
	<div
		class="slash glass strong"
		role="listbox"
		aria-label="Blocks"
		bind:this={list}
		transition:fadeSlide={{ y: 4 }}
		use:hideOnOutro
	>
		{#each items as item, i (item.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- keys go through the editor, which keeps focus -->
			<div
				class="opt"
				class:selected={i === selected}
				role="option"
				aria-selected={i === selected}
				tabindex="-1"
				onmousedown={(e) => e.preventDefault()}
				onclick={() => command(item)}
			>
				<span class="glyph" aria-hidden="true">
					{#if glyph(item.icon)}{item.icon}{:else}<Icon name={item.icon as IconName} size={18} />{/if}
				</span>
				<span>{item.label}</span>
			</div>
		{:else}
			<p class="none">{COPY.noResults}</p>
		{/each}
	</div>
{/if}

<style>
	.slash {
		position: fixed;
		z-index: 70;
		display: grid;
		gap: 2px;
		inline-size: 300px;
		max-inline-size: calc(100vw - 16px);
		max-block-size: 320px;
		overflow-y: auto;
		padding: var(--s-2);
		border-radius: var(--r-xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
		font-size: var(--t-body);
		line-height: 1.3;
	}

	.strong {
		background-color: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.opt {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-2) var(--s-3);
		border-radius: var(--r-lg);
		color: var(--ink);
	}

	.opt.selected {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
	}

	.glyph {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface);
		font-size: var(--t-small);
		font-weight: 600;
	}

	.none {
		margin: 0;
		padding: var(--s-3);
		color: var(--ink-2);
	}
</style>
