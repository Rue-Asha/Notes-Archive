<script lang="ts" module>
	export interface MenuItem {
		label: string;
		icon?: string;
		disabled?: boolean;
		danger?: boolean;
		separator?: boolean;
		hint?: string;
		kbd?: string;
		onselect(): void;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import Icon, { type IconName } from './Icon.svelte';
	import { pop as soft } from './motion.ts';
	import { portal } from './overlay.ts';

	type Props = { open: boolean; anchor: HTMLElement | null; label: string; items: MenuItem[]; onclose(): void };

	let { open, anchor, label, items, onclose }: Props = $props();

	let pop = $state<HTMLDivElement>();

	const byLabel = $derived(new Map(items.map((item) => [item.label, item])));
	const entries = $derived(items.map(({ label, disabled, danger, separator, hint, kbd }, at) => ({ label, disabled, danger, hint, kbd, separator: separator ?? (!!danger && at > 0) })));

	$effect(() => {
		if (!open) return;
		tick().then(() => {
			place();
			pop?.querySelector<HTMLElement>('.item:not(:disabled)')?.focus();
		});
	});

	// below the anchor, flipped above when the viewport is short, kept inside the viewport sideways; a trigger in the
	// right half of the window lines the menu up with its right edge, so it opens inwards and stays inside the frame
	function place() {
		if (!pop || !anchor) return;
		const a = anchor.getBoundingClientRect();
		const { offsetWidth: w, offsetHeight: h } = pop;
		const gap = 6;
		const below = a.bottom + gap + h <= innerHeight || a.top - gap - h < 0;
		const top = below ? a.bottom + gap : a.top - gap - h;
		pop.style.insetBlockStart = `${Math.max(8, Math.min(top, innerHeight - h - 8))}px`;
		const end = a.left + a.width / 2 > innerWidth / 2;
		pop.style.insetInlineStart = `${Math.max(8, Math.min(end ? a.right - w : a.left, innerWidth - w - 8))}px`;
		// it grows out of the trigger's side
		pop.style.transformOrigin = `${below ? 'top' : 'bottom'} ${end ? 'right' : 'left'}`;
	}

	// the anchor may be a wrapper around the real button
	const opener = () => (anchor?.matches('button, [tabindex]') ? anchor : anchor?.querySelector<HTMLElement>('button'));

	function close(refocus: boolean) {
		onclose();
		if (refocus) opener()?.focus();
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
		} else if (event.key === 'Tab') close(false);
	}

	function select(entry: { label: string }) {
		const item = byLabel.get(entry.label);
		if (!item || item.disabled) return;
		close(true);
		item.onselect();
	}

	// the click that lands on plain page leaves focus on <body>, so the opener takes it back unless another control got it
	function outside(event: PointerEvent) {
		const target = event.target as Node;
		if (!open || pop?.contains(target) || anchor?.contains(target)) return;
		onclose();
		setTimeout(() => {
			if (!document.activeElement || document.activeElement === document.body) opener()?.focus();
		});
	}
</script>

<svelte:window onpointerdown={outside} />

{#if open}
	<div class="pop" bind:this={pop} use:portal onkeydown={keys} role="presentation" in:soft out:soft>
		<Menu name={label} items={entries} onselect={select}>
			{#snippet icon(entry)}
				{@const name = byLabel.get(entry.label)?.icon}
				{#if name}<Icon name={name as IconName} size={18} />{/if}
			{/snippet}
		</Menu>
	</div>
{/if}

<style>
	/* the sort popover and the bars sit at --z-toast; the portal comes later in the document, so equal wins */
	.pop {
		position: fixed;
		z-index: var(--z-toast);
		inline-size: max-content;
		min-inline-size: 12rem;
		max-inline-size: min(19rem, calc(100vw - 16px));
		max-block-size: calc(100dvh - 16px);
		display: flex;
	}

	.pop :global(.menu) {
		max-block-size: 100%;
		overflow-y: auto;
	}
</style>
