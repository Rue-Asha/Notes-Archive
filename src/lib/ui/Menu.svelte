<script lang="ts" module>
	export interface MenuItem {
		label: string;
		icon?: string;
		disabled?: boolean;
		danger?: boolean;
		onselect(): void;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import Icon, { type IconName } from './Icon.svelte';
	import { portal } from './overlay.ts';

	type Props = { open: boolean; anchor: HTMLElement | null; label: string; items: MenuItem[]; onclose(): void };

	let { open, anchor, label, items, onclose }: Props = $props();

	let menu = $state<HTMLDivElement>();

	const enabled = () => [...(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];

	$effect(() => {
		if (!open) return;
		tick().then(() => {
			place();
			enabled()[0]?.focus();
		});
	});

	// below the anchor, flipped above when the viewport is short, kept inside the viewport sideways
	function place() {
		if (!menu || !anchor) return;
		const a = anchor.getBoundingClientRect();
		const { offsetWidth: w, offsetHeight: h } = menu;
		const gap = 6;
		const below = a.bottom + gap + h <= innerHeight || a.top - gap - h < 0;
		menu.style.insetBlockStart = `${below ? a.bottom + gap : a.top - gap - h}px`;
		menu.style.insetInlineStart = `${Math.max(8, Math.min(a.left, innerWidth - w - 8))}px`;
	}

	function close(refocus: boolean) {
		onclose();
		if (refocus) anchor?.focus();
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
			return;
		}
		if (event.key === 'Tab') return close(false);
		const list = enabled();
		const at = list.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: list.length - 1 };
		if (!(event.key in moves)) return;
		event.preventDefault();
		list[(moves[event.key] + list.length) % list.length]?.focus();
	}

	function select(item: MenuItem) {
		if (item.disabled) return;
		close(true);
		item.onselect();
	}

	function outside(event: PointerEvent) {
		const target = event.target as Node;
		if (open && !menu?.contains(target) && !anchor?.contains(target)) onclose();
	}
</script>

<svelte:window onpointerdown={outside} />

{#if open}
	<div class="menu glass strong" role="menu" aria-label={label} tabindex="-1" bind:this={menu} use:portal onkeydown={keys} transition:fadeSlide={{ y: 6 }} use:hideOnOutro>
		{#each items as item (item.label)}
			<button type="button" role="menuitem" class="item" class:danger={item.danger} aria-disabled={item.disabled ? 'true' : undefined} tabindex="-1" onmousedown={(e) => item.disabled && e.preventDefault()} onclick={() => select(item)}>
				{#if item.icon}<Icon name={item.icon as IconName} size={18} />{/if}
				<span>{item.label}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.menu {
		position: fixed;
		z-index: 90;
		display: grid;
		min-inline-size: 200px;
		max-inline-size: calc(100vw - 16px);
		padding: var(--s-2);
		border-radius: var(--r-lg);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.item {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-block-size: var(--control);
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink);
		font-size: var(--t-body);
		text-align: start;
	}

	.item:hover:not([aria-disabled='true']),
	.item:focus-visible {
		background: var(--row-hover);
	}

	.item:focus-visible {
		outline: none;
		box-shadow: var(--row-active-shadow);
		background: var(--row-active);
	}

	.item[aria-disabled='true'] {
		opacity: 0.4;
		cursor: default;
	}

	.danger {
		color: var(--danger);
	}
</style>
