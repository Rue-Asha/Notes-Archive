<script lang="ts">
	import Icon from './Icon.svelte';
	import type { TreeSort } from '../../fixtures.ts';
	import { sortLabels } from './data.ts';

	let { mode, open = false, align = 'end' }: { mode: TreeSort; open?: boolean; align?: 'start' | 'end' } = $props();

	/* svelte-ignore state_referenced_locally */
	let shown = $state(open);
	/* svelte-ignore state_referenced_locally */
	let picked = $state(mode);
	const modes = Object.keys(sortLabels) as TreeSort[];
</script>

<div class="sort">
	<button type="button" class="icon" aria-label="Sort folders" aria-haspopup="menu" aria-expanded={shown} onclick={() => (shown = !shown)}><Icon name="sort" size={16} /></button>
	{#if shown}
		<div class="menu" role="menu" aria-label="Sort folders" data-align={align}>
			{#each modes as m (m)}
				<button type="button" role="menuitemradio" aria-checked={m === picked} onclick={() => ((picked = m), (shown = false))}>
					<span class="tick">{#if m === picked}<Icon name="check" size={16} />{/if}</span>{sortLabels[m]}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.sort {
		position: relative;
	}
	.icon {
		display: grid;
		place-items: center;
		inline-size: max(var(--target), 30px);
		block-size: max(var(--target), 30px);
		padding: 0;
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: var(--ink-secondary);
	}
	.icon[aria-expanded='true'] {
		background: var(--surface-tint-strong);
	}
	.menu {
		position: absolute;
		inset-block-start: 100%;
		z-index: var(--z-menu);
		display: grid;
		inline-size: 11rem;
		padding: var(--space-1);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-item);
		background: var(--surface-raised);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
	}
	.menu[data-align='end'] {
		inset-inline-end: 0;
	}
	.menu button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--target), 34px);
		padding: 0 var(--space-2);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		text-align: start;
	}
	.menu button[aria-checked='true'] {
		font-weight: var(--weight-semibold);
	}
	.tick {
		display: grid;
		place-items: center;
		inline-size: 16px;
	}
	@media (hover: hover) {
		.icon:hover,
		.menu button:hover {
			background: var(--surface-tint);
		}
	}
</style>
