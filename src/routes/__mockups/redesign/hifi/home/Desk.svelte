<script lang="ts">
	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import type { MockCard } from '../../fixtures.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '../note/Icon.svelte';
	import Toast from '../ui/Toast.svelte';
	import { PINNED_CONFLICT, SAVE_FAILED, noteCount } from './data.ts';
	import Entry from './Entry.svelte';

	type Props = {
		pinned: MockCard[];
		recent: MockCard[];
		empty?: boolean;
		menu?: { list: 'pinned' | 'recent'; id: number } | null;
		outcome?: 'saved' | 'conflict' | 'failed';
		toast?: { message: string; kind?: 'info' | 'error' } | null;
		bar?: boolean;
	};
	let { pinned, recent, empty = false, menu = null, outcome = 'saved', toast = null, bar = true }: Props = $props();

	const calm = new MediaQuery('prefers-reduced-motion: reduce');
	let order = $state<MockCard[] | null>(null);
	const pins = $derived(order ?? pinned);
	// svelte-ignore state_referenced_locally
	let open = $state<string | null>(menu ? `${menu.list}-${menu.id}` : null);
	// svelte-ignore state_referenced_locally
	let message = $state(toast);
	let announce = $state('');
	let drag = $state<{ from: number; to: number; dy: number; pitch: number } | null>(null);

	const toggle = (key: string) => (open = open === key ? null : key);

	function commit(from: number, to: number) {
		if (from === to) return;
		const before = pins;
		const next = [...pins];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		order = next;
		if (outcome === 'saved') {
			announce = `${item.title} moved to position ${to + 1} of ${next.length}`;
			return;
		}
		// the server answered 409 or the save failed: the list comes back as the server has it
		message = outcome === 'conflict' ? { message: PINNED_CONFLICT } : { message: SAVE_FAILED, kind: 'error' };
		setTimeout(() => (order = before), 0);
	}

	async function move(card: MockCard, from: number, to: number) {
		open = null;
		commit(from, to);
		await tick();
		document.getElementById(`menu-btn-p-${card.id}`)?.focus();
	}

	function grip(e: PointerEvent, i: number) {
		const li = (e.currentTarget as HTMLElement).closest('li');
		if (!li || e.button !== 0) return;
		open = null;
		const gap = Number.parseFloat(getComputedStyle(li.parentElement as HTMLElement).rowGap) || 0;
		const pitch = li.offsetHeight + gap;
		const startY = e.clientY;
		drag = { from: i, to: i, dy: 0, pitch };
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		const onmove = (m: PointerEvent) => {
			const dy = Math.max(-i * pitch, Math.min((pins.length - 1 - i) * pitch, m.clientY - startY));
			drag = { from: i, to: Math.round(i + dy / pitch), dy, pitch };
		};
		const end = () => {
			target.removeEventListener('pointermove', onmove);
			target.removeEventListener('pointerup', end);
			target.removeEventListener('pointercancel', end);
			const to = drag?.to ?? i;
			drag = null;
			commit(i, to);
		};
		target.addEventListener('pointermove', onmove);
		target.addEventListener('pointerup', end);
		target.addEventListener('pointercancel', end);
	}

	function shift(i: number) {
		if (!drag || i === drag.from) return 0;
		if (drag.from < drag.to && i > drag.from && i <= drag.to) return -drag.pitch;
		if (drag.from > drag.to && i >= drag.to && i < drag.from) return drag.pitch;
		return 0;
	}
	const offset = (i: number) => (drag ? (i === drag.from ? drag.dy : shift(i)) : 0);
</script>

<svelte:window onclick={(e) => !(e.target as HTMLElement).closest?.('.entry') && (open = null)} />

<div class="desk">
	{#if bar}
	<div class="seg-bar">
		<button type="button" class="seg search" aria-label="Search notes">
			<Icon name="search" /><span class="hint">Search notes</span><kbd>Ctrl K</kbd>
		</button>
		<div class="seg-actions">
			<Button variant="primary" arrow>New note</Button>
		</div>
	</div>
	{/if}

	{#if empty}
		<section class="card welcome" aria-label="Welcome">
			<h2>Write your first note</h2>
			<p>Notes you write live here, filed in folders and found by search.</p>
			<Button variant="secondary"><Icon name="plus" />New note</Button>
		</section>
	{:else}
		<div class="lists" class:single={pins.length === 0}>
			{#if pins.length}
				<section class="card" aria-labelledby="pinned-h">
					<div class="card-head"><h2 id="pinned-h">Pinned</h2><span class="card-note">{noteCount(pins.length)}</span></div>
					<ul class="rows" class:moving={drag}>
						{#each pins as card, i (card.id)}
							<li animate:flip={{ duration: calm.current || drag ? 0 : 160 }} class:lift={drag?.from === i} class:slide={drag && drag.from !== i} style:transform={offset(i) ? `translateY(${offset(i)}px)` : undefined}>
								<Entry
									{card}
									pinned
									open={open === `pinned-${card.id}`}
									dragging={drag?.from === i}
									ontoggle={() => toggle(`pinned-${card.id}`)}
									onclose={() => (open = null)}
									ongrip={(e) => grip(e, i)}
									reorder={pins.length > 1 ? { canUp: i > 0, canDown: i < pins.length - 1, up: () => move(card, i, i - 1), down: () => move(card, i, i + 1) } : null}
								/>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
			{#if recent.length}
			<section class="card" aria-labelledby="recent-h">
				<div class="card-head"><h2 id="recent-h">Recently edited</h2><span class="card-note">{noteCount(recent.length)}</span></div>
				<ul class="rows">
					{#each recent as card (card.id)}
						<li><Entry {card} open={open === `recent-${card.id}`} ontoggle={() => toggle(`recent-${card.id}`)} onclose={() => (open = null)} /></li>
					{/each}
				</ul>
			</section>
			{/if}
		</div>
	{/if}

	<p class="sr-only" role="status">{announce}</p>
	{#if message}<div class="toast-slot"><Toast message={message.message} kind={message.kind} /></div>{/if}
</div>

<style>
	.desk { display: grid; gap: var(--space-5); min-inline-size: 0; }
	.seg-bar { justify-self: stretch; }
	.seg.search { flex: 1 1 14rem; min-inline-size: 0; border: 0; background: transparent; text-align: start; color: var(--ink-secondary); border-radius: var(--radius-pill); }
	.seg.search .hint { flex: 1; font-size: var(--type-body-s-size); }
	.seg.search > :global(svg) { color: var(--ink); }
	kbd { padding: var(--space-0-5) var(--space-2); border-radius: var(--radius-pill); box-shadow: var(--ring-hairline); font-family: var(--font-ui); font-size: var(--type-caption-size); color: var(--ink-secondary); }
	@media (max-width: 767px), (pointer: coarse) {
		kbd { display: none; }
	}
	@media (max-width: 1023px) {
		.seg-actions { display: none; }
	}
	@media (hover: hover) and (pointer: fine) {
		.seg.search:hover { background: var(--surface-tint); }
	}
	.lists { display: grid; gap: var(--space-4); align-items: start; grid-template-columns: minmax(0, 1fr); }
	@media (min-width: 1100px) {
		.lists:not(.single) { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
	}
	.card { padding: var(--space-5) var(--space-4) var(--space-4); min-inline-size: 0; }
	@media (max-width: 359px) {
		.card { padding-inline: var(--space-2); }
	}
	.card-head { margin-block-end: var(--space-3); padding-inline: var(--space-2); }
	.rows { display: grid; gap: var(--space-2); }
	.lists > section:has(:global(.menu)) { position: relative; z-index: var(--z-menu); }
	.rows > li { position: relative; }
	.rows > li:has(:global(.menu)) { z-index: var(--z-menu); }
	.rows > .lift { z-index: var(--z-raised); }
	.slide { transition: transform var(--motion-quick) var(--ease-out); }
	.welcome { display: grid; justify-items: start; gap: var(--space-4); padding: var(--space-10) var(--space-8); }
	.welcome p { max-inline-size: 40ch; font-size: var(--type-body-size); line-height: var(--type-body-line); color: var(--ink-secondary); }
	.toast-slot { justify-self: start; max-inline-size: 100%; }
</style>
