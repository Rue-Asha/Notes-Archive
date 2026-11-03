<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		label: string;
		onremove?: () => void;
		href?: string;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class'>;

	let { label, onremove, href, class: cls = '', ...rest }: Props = $props();
</script>

{#if href}
	<a class="chip {cls}" {href} {...rest}>{label}</a>
{:else}
	<span class="chip {cls}" {...rest}>
		<span>{label}</span>
		{#if onremove}
			<button type="button" class="remove" aria-label="Remove {label}" onclick={onremove}><Icon name="close" size={14} /></button>
		{/if}
	</span>
{/if}

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		min-block-size: 30px;
		padding: 0 var(--s-3);
		border: 1px solid var(--chip-border);
		border-radius: var(--r-pill);
		background: var(--chip-bg);
		box-shadow: 0 0 0 1px var(--line);
		color: var(--ink);
		font-size: var(--t-small);
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
	}

	a.chip {
		transition: transform var(--d-fast) var(--ease-out);
	}

	a.chip:hover {
		transform: translateY(-1px);
	}

	.remove {
		display: inline-grid;
		place-items: center;
		inline-size: var(--s-6);
		block-size: var(--s-6);
		margin-inline-end: calc(var(--s-2) * -1);
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
	}
</style>
