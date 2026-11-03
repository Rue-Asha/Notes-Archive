<script lang="ts">
	import { tick } from 'svelte';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import { searchEmoji } from './emoji.ts';
	import { portal } from './overlay.ts';

	type Props = { open: boolean; anchor: HTMLElement | null; onpick(emoji: string | null): void; onclose(): void };

	let { open, anchor, onpick, onclose }: Props = $props();

	let picker = $state<HTMLDivElement>();
	let query = $state('');

	const shown = $derived(searchEmoji(query));

	$effect(() => {
		if (!open) return;
		query = '';
		tick().then(() => {
			place();
			picker?.querySelector<HTMLInputElement>('input')?.focus();
		});
	});

	// on a phone the CSS makes it a full-width sheet; elsewhere it hangs below the anchor, flipped above when short
	function place() {
		if (!picker || !anchor || matchMedia('(max-width: 1023px)').matches) return;
		const a = anchor.getBoundingClientRect();
		const { offsetWidth: w, offsetHeight: h } = picker;
		const gap = 6;
		const below = a.bottom + gap + h <= innerHeight || a.top - gap - h < 0;
		picker.style.insetBlockStart = `${below ? a.bottom + gap : a.top - gap - h}px`;
		picker.style.insetInlineStart = `${Math.max(8, Math.min(a.left, innerWidth - w - 8))}px`;
	}

	function close() {
		onclose();
		anchor?.focus();
	}

	function pick(emoji: string | null) {
		close();
		onpick(emoji);
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
			return;
		}
		if (event.key === 'Tab') return;
		const input = picker!.querySelector('input')!;
		const cells = [...picker!.querySelectorAll<HTMLElement>('.cell')];
		const at = cells.indexOf(document.activeElement as HTMLElement);
		if (at < 0) {
			if (event.key === 'ArrowDown' && document.activeElement === input) {
				event.preventDefault();
				cells[0]?.focus();
			}
			return;
		}
		const cols = getComputedStyle(picker!.querySelector('.grid')!).gridTemplateColumns.split(' ').length;
		const moves: Record<string, number> = { ArrowRight: at + 1, ArrowLeft: at - 1, ArrowDown: at + cols, ArrowUp: at - cols };
		if (!(event.key in moves)) return;
		event.preventDefault();
		const to = moves[event.key];
		if (to < 0) input.focus();
		else cells[Math.min(cells.length - 1, to)]?.focus();
	}

	function outside(event: PointerEvent) {
		const target = event.target as Node;
		if (open && !picker?.contains(target) && !anchor?.contains(target)) onclose();
	}
</script>

<svelte:window onpointerdown={outside} />

{#if open}
	<div class="layer" use:portal>
		<div class="scrim" role="presentation" transition:fadeSlide={{ y: 0 }}></div>
		<div class="picker glass strong" role="dialog" aria-label="Choose an emoji" tabindex="-1" bind:this={picker} onkeydown={keys} transition:fadeSlide={{ y: 6 }} use:hideOnOutro>
			<input class="search" type="search" placeholder="Search emoji" aria-label="Search emoji" autocomplete="off" bind:value={query} />
			<div class="grid" role="group" aria-label="Emoji">
				{#each shown as emoji (emoji.char)}
					<button type="button" class="cell" aria-label={emoji.name} tabindex="-1" onclick={() => pick(emoji.char)}>{emoji.char}</button>
				{:else}
					<p class="none">No emoji match “{query.trim()}”</p>
				{/each}
			</div>
			<button type="button" class="remove" onclick={() => pick(null)}>Remove</button>
		</div>
	</div>
{/if}

<style>
	.layer {
		position: fixed;
		inset: 0;
		z-index: 80;
		pointer-events: none;
	}

	.scrim {
		display: none;
	}

	.picker {
		position: fixed;
		z-index: 80;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		gap: var(--s-3);
		inline-size: 340px;
		max-block-size: min(60dvh, 420px);
		padding: var(--s-3);
		border-radius: var(--r-lg);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
		pointer-events: auto;
	}

	.search {
		min-block-size: var(--control);
		padding: 0 var(--s-4);
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: color-mix(in srgb, var(--glass-fallback) 60%, transparent);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
		align-content: start;
		gap: 2px;
		overflow: auto;
	}

	.cell {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		font-size: 22px;
		line-height: 1;
	}

	.cell:hover,
	.cell:focus-visible {
		background: var(--row-hover);
	}

	.cell:focus-visible {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
	}

	.none {
		grid-column: 1 / -1;
		padding: var(--s-4);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.remove {
		min-block-size: var(--control);
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink-2);
		font-size: var(--t-body);
		font-weight: 500;
	}

	.remove:hover {
		background: var(--row-hover);
		color: var(--ink);
	}

	@media (max-width: 1023px) {
		.scrim {
			display: block;
			position: absolute;
			inset: 0;
			background: color-mix(in srgb, var(--ink) 28%, transparent);
			pointer-events: auto;
		}

		.picker {
			inset-inline: 0;
			inset-block-end: 0;
			inline-size: 100%;
			max-block-size: 70dvh;
			padding-block-end: calc(var(--s-3) + env(safe-area-inset-bottom));
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}

		.grid {
			grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		}
	}
</style>
