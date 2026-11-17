<script lang="ts">
	import Icon from './Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import type { TreeSort } from '../../fixtures.ts';
	import { sortHints, sortLabels } from '../ui/sort.ts';

	type Props = { mode: TreeSort; open?: boolean; align?: 'start' | 'end'; glass?: boolean; fails?: boolean; onfail?: () => void };
	let { mode, open = false, align = 'end', glass = false, fails = false, onfail }: Props = $props();

	/* svelte-ignore state_referenced_locally */
	let shown = $state(open);
	/* svelte-ignore state_referenced_locally */
	let picked = $state(mode);
	let host = $state<HTMLDivElement>();
	const modes = Object.keys(sortLabels) as TreeSort[];

	// the PATCH answers with an error: the picked mode shows for a beat, then the saved one returns and a toast says why
	function pick(m: TreeSort) {
		const before = picked;
		picked = m;
		shown = false;
		if (!fails || m === before) return;
		setTimeout(() => {
			picked = before;
			onfail?.();
		}, 600);
	}

	function key(e: KeyboardEvent) {
		const items = [...(host?.querySelectorAll<HTMLElement>('[role=menuitemradio]') ?? [])];
		const at = items.indexOf(document.activeElement as HTMLElement);
		if (e.key === 'Escape') {
			shown = false;
			host?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			items.at((at + (e.key === 'ArrowDown' ? 1 : -1)) % items.length)?.focus();
		}
	}
</script>

<svelte:window onclick={(e) => shown && host && !host.contains(e.target as Node) && (shown = false)} />

<div class="sort" bind:this={host} onkeydown={key} role="presentation">
	<Button variant={glass ? 'glass' : 'quiet'} size="xs" icon aria-label="Sort folders" aria-haspopup="menu" aria-expanded={shown} onclick={() => (shown = !shown)}><Icon name="sort" size={16} /></Button>
	{#if shown}
		<div class="menu" role="menu" aria-label="Sort folders" data-align={align}>
			{#each modes as m (m)}
				<button type="button" role="menuitemradio" aria-checked={m === picked} onclick={() => pick(m)}>
					<span class="tick">{#if m === picked}<Icon name="check" size={16} />{/if}</span>
					<span class="stack"><span class="label">{sortLabels[m]}</span><span class="hint">{sortHints[m]}</span></span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.sort {
		position: relative;
	}
	.menu {
		position: absolute;
		inset-block-start: calc(100% + var(--space-1));
		z-index: var(--z-menu);
		display: grid;
		inline-size: 15rem;
		max-inline-size: calc(100vw - var(--space-8));
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
	}
	.menu[data-align='end'] {
		inset-inline-end: 0;
	}
	.menu[data-align='start'] {
		inset-inline-start: 0;
	}
	.menu button {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		min-block-size: var(--target);
		padding: var(--space-2) var(--space-2-5);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		text-align: start;
	}
	.stack {
		display: grid;
		min-inline-size: 0;
	}
	.label {
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}
	.hint {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.menu button[aria-checked='true'] .label {
		font-weight: var(--weight-semibold);
	}
	.tick {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: 16px;
		block-size: calc(var(--type-body-s-size) * var(--type-body-s-line));
	}
	@media (hover: hover) {
		.menu button:hover {
			background: var(--surface-tint);
		}
	}
</style>
