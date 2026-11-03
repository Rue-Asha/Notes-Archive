<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		icon: IconName;
		label: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let { icon, label, href, onclick, class: cls = '', ...rest }: Props = $props();
</script>

{#if href}
	<a class="icon-btn glass {cls}" {href} aria-label={label} {...rest}><Icon name={icon} /></a>
{:else}
	<button type="button" class="icon-btn glass {cls}" aria-label={label} {onclick} {...rest}><Icon name={icon} /></button>
{/if}

<style>
	.icon-btn {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: var(--control);
		block-size: var(--control);
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.icon-btn:hover {
		transform: scale(1.05);
	}

	.icon-btn:active {
		transform: scale(0.94);
	}
</style>
