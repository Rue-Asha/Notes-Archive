<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import NoteCard from '#lib/notes/NoteCard.svelte';
	import { toast } from '#lib/shell/toast.ts';
	import type { NoteCard as Note } from '#lib/types.ts';
	import { arrive, depart, reflow } from '#lib/ui/motion.ts';
	import { moved, savePinnedOrder } from './pinned.ts';

	let { notes }: { notes: Note[] } = $props();

	let order = $state<Note[] | null>(null);
	let announce = $state('');
	let drag = $state<{ from: number; to: number; dy: number; pitch: number } | null>(null);
	let saving = Promise.resolve();
	let pending = 0;
	// bumped when a save fails: moves queued behind it were built on the order it reverted, so they are dropped
	let epoch = 0;

	const pins = $derived(order ?? notes);

	// an optimistic move; the server's answer decides whether it stays
	function commit(from: number, to: number) {
		if (from === to) return;
		const next = moved(pins, from, to);
		order = next;
		announce = `${next[to].title.trim() || COPY.untitled} moved to position ${to + 1} of ${next.length}`;
		pending++;
		const base = epoch;
		saving = saving.then(async () => {
			if (base !== epoch) {
				pending--;
				return;
			}
			const outcome = await savePinnedOrder(next.map((n) => n.id));
			pending--;
			if (outcome === 'saved') {
				await invalidateAll();
				if (!pending) order = null;
				return;
			}
			epoch++;
			order = null;
			await invalidateAll();
			if (outcome === 'stale') toast(COPY.pinnedConflict);
			else toast(COPY.saveFailed, 'error');
		});
	}

	// moving the node in the keyed list drops focus, so the moved entry's menu button takes it back
	async function step(note: Note, from: number, to: number) {
		commit(from, to);
		await tick();
		document.querySelector<HTMLElement>(`[data-pinned-id="${note.id}"] .more`)?.focus();
	}

	function grip(event: PointerEvent, from: number) {
		const item = (event.currentTarget as HTMLElement).closest('li');
		if (!item || event.button !== 0) return;
		const gap = Number.parseFloat(getComputedStyle(item.parentElement as HTMLElement).rowGap) || 0;
		const pitch = item.offsetHeight + gap;
		const startY = event.clientY;
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
		drag = { from, to: from, dy: 0, pitch };
		const onmove = (move: PointerEvent) => {
			const dy = Math.max(-from * pitch, Math.min((pins.length - 1 - from) * pitch, move.clientY - startY));
			drag = { from, to: Math.round(from + dy / pitch), dy, pitch };
		};
		const end = () => {
			handle.removeEventListener('pointermove', onmove);
			handle.removeEventListener('pointerup', end);
			handle.removeEventListener('pointercancel', end);
			const to = drag?.to ?? from;
			drag = null;
			commit(from, to);
		};
		handle.addEventListener('pointermove', onmove);
		handle.addEventListener('pointerup', end);
		handle.addEventListener('pointercancel', end);
	}

	function shift(i: number) {
		if (!drag || i === drag.from) return 0;
		if (drag.from < drag.to && i > drag.from && i <= drag.to) return -drag.pitch;
		if (drag.from > drag.to && i >= drag.to && i < drag.from) return drag.pitch;
		return 0;
	}
	const offset = (i: number) => (drag ? (i === drag.from ? drag.dy : shift(i)) : 0);
</script>

<section class="card" aria-labelledby="home-pinned" data-pinned>
	<div class="card-head"><h2 id="home-pinned">Pinned</h2><span class="card-note">{COPY.noteCount(pins.length)}</span></div>
	<ul class="rows" data-pinned-list>
		{#each pins as note, i (note.id)}
			<li
				data-pinned-id={note.id}
				animate:reflow={{ live: !drag }}
				in:arrive|global
				out:depart
				class:lift={drag?.from === i}
				class:slide={drag && drag.from !== i}
				style:transform={offset(i) ? `translateY(${offset(i)}px)` : undefined}
			>
				<NoteCard
					{note}
					home
					dragging={drag?.from === i}
					ongrip={(event) => grip(event, i)}
					reorder={pins.length > 1 ? { canUp: i > 0, canDown: i < pins.length - 1, up: () => step(note, i, i - 1), down: () => step(note, i, i + 1) } : null}
				/>
			</li>
		{/each}
	</ul>
	<p class="sr-only" role="status">{announce}</p>
</section>

<style>
	.card {
		padding: var(--space-5) var(--space-4) var(--space-4);
		min-inline-size: 0;
	}

	.card-head {
		margin-block-end: var(--space-3);
		padding-inline: var(--space-2);
	}

	.rows {
		display: grid;
		gap: var(--space-2);
	}

	.rows > li {
		position: relative;
		min-inline-size: 0;
	}

	.rows > .lift {
		z-index: var(--z-raised);
	}

	.slide {
		transition: transform var(--motion-quick) var(--ease-out);
	}

	@media (max-width: 359px) {
		.card {
			padding-inline: var(--space-2);
		}
	}
</style>
