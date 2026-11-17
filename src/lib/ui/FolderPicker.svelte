<script lang="ts">
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import type { Id, Tree } from '#lib/types.ts';
	import { pickable } from './folderPicker.ts';
	import Icon from './Icon.svelte';

	type Props = { open: boolean; tree: Tree; current: Id | null; exclude?: Id; onpick(folderId: Id | null): void; oncancel(): void };

	let { open, tree, current, exclude, onpick, oncancel }: Props = $props();

	let list = $state<HTMLElement>();

	const rows = $derived(pickable(tree, exclude));

	$effect(() => {
		if (open) tick().then(() => (list?.querySelector<HTMLElement>('[aria-selected="true"]') ?? list?.querySelector<HTMLElement>('[role="option"]'))?.focus());
	});

	function keys(event: KeyboardEvent) {
		const options = [...list!.querySelectorAll<HTMLElement>('[role="option"]')];
		const at = options.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: options.length - 1 };
		if (at < 0 || !(event.key in moves)) return;
		event.preventDefault();
		options[(moves[event.key] + options.length) % options.length].focus();
	}
</script>

<Sheet bind:open={() => open, (next) => !next && oncancel()} title="Move to" kicker="Choose a folder" label="Choose a folder">
	<div class="list" role="listbox" aria-label="Folders" tabindex="-1" bind:this={list} onkeydown={keys}>
		{#each rows as row (row.id)}
			<button
				type="button"
				role="option"
				class="row"
				aria-selected={row.id === current}
				tabindex="-1"
				style:--depth={Math.min(row.depth, 6)}
				onclick={() => onpick(row.id)}
			>
				<span class="tick" aria-hidden="true"><Icon name="check" size={14} /></span>
				<span class="name">{row.name}</span>
			</button>
		{/each}
	</div>
	{#snippet actions()}
		<Button onclick={oncancel}>Cancel</Button>
	{/snippet}
</Sheet>

<style>
	.list {
		display: grid;
		grid-auto-rows: max-content;
		align-content: start;
		gap: var(--space-0-5);
		max-block-size: min(60dvh, 28rem);
		padding: var(--space-1);
		overflow: auto;
		overscroll-behavior: contain;
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}

	.row {
		display: grid;
		grid-template-columns: var(--space-6) minmax(0, 1fr);
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-block: var(--space-1);
		padding-inline-end: var(--space-3);
		padding-inline-start: calc(var(--space-2) + var(--depth, 0) * var(--space-3));
		border: 0;
		border-radius: var(--radius-panel);
		background: none;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		text-align: start;
	}

	.tick {
		display: grid;
		place-items: center;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: transparent;
	}

	.row[aria-selected='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.row[aria-selected='true'] .tick {
		box-shadow: none;
		color: var(--ink);
	}

	.row[aria-selected='true']:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}

	.name {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	@media (hover: hover) {
		.row:not([aria-selected='true']):hover {
			background: var(--surface-selected);
		}
	}
</style>
