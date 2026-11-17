<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import { searchEmoji } from './emoji.ts';
	import Icon from './Icon.svelte';

	type Props = { open: boolean; anchor: HTMLElement | null; onpick(emoji: string | null): void; onclose(): void };

	let { open, onpick, onclose }: Props = $props();

	let body = $state<HTMLElement>();
	let query = $state('');

	const shown = $derived(searchEmoji(query));

	$effect(() => {
		if (open) query = '';
	});

	function pick(emoji: string | null) {
		onclose();
		onpick(emoji);
	}

	function keys(event: KeyboardEvent) {
		const input = body!.querySelector('input')!;
		const cells = [...body!.querySelectorAll<HTMLElement>('.cell')];
		const at = cells.indexOf(document.activeElement as HTMLElement);
		if (at < 0) {
			if (event.key === 'ArrowDown' && document.activeElement === input) {
				event.preventDefault();
				cells[0]?.focus();
			}
			return;
		}
		const cols = getComputedStyle(body!.querySelector('.grid')!).gridTemplateColumns.split(' ').length;
		const moves: Record<string, number> = { ArrowRight: at + 1, ArrowLeft: at - 1, ArrowDown: at + cols, ArrowUp: at - cols };
		if (!(event.key in moves)) return;
		event.preventDefault();
		const to = moves[event.key];
		if (to < 0) input.focus();
		else cells[Math.min(cells.length - 1, to)]?.focus();
	}
</script>

<Sheet bind:open={() => open, (next) => !next && onclose()} title="Icon" label="Choose an emoji">
	<div class="picker" bind:this={body} role="presentation" onkeydown={keys}>
		<label class="field">
			<span class="affix" aria-hidden="true"><Icon name="search" size={18} /></span>
			<!-- svelte-ignore a11y_autofocus -->
			<input type="search" placeholder="Search emoji" aria-label="Search emoji" autocomplete="off" autofocus bind:value={query} />
		</label>
		<div class="grid" role="group" aria-label="Emoji">
			{#each shown as emoji (emoji.char)}
				<button type="button" class="cell" aria-label={emoji.name} onclick={() => pick(emoji.char)}>{emoji.char}</button>
			{:else}
				<p class="none">No emoji match “{query.trim()}”</p>
			{/each}
		</div>
	</div>
	{#snippet actions()}
		<Button onclick={() => pick(null)}>{COPY.removeIcon}</Button>
		<Button onclick={onclose}>Cancel</Button>
	{/snippet}
</Sheet>

<style>
	.picker {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.field {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}

	.field:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.affix {
		display: inline-flex;
		color: var(--ink-secondary);
	}

	input {
		flex: 1;
		inline-size: 100%;
		min-inline-size: 0;
		min-block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		background: none;
		font-family: var(--font-ui);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}

	input:focus-visible {
		outline: none;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(max(var(--control-height), var(--target)), 1fr));
		align-content: start;
		gap: var(--space-1);
		max-block-size: min(45dvh, 22rem);
		overflow: auto;
		overscroll-behavior: contain;
	}

	.cell {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border: 0;
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		font-size: var(--type-title-size);
		line-height: 1;
	}

	.none {
		grid-column: 1 / -1;
		padding: var(--space-8) var(--space-3);
		color: var(--ink-secondary);
		font-size: var(--type-body-s-size);
		text-align: center;
		overflow-wrap: anywhere;
	}

	@media (hover: hover) {
		.cell:hover {
			background: var(--surface-selected);
		}
	}
</style>
