<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		label?: string;
		href?: string;
		variant?: 'ink' | 'light' | 'accent';
		size?: 'sm' | 'md';
		// the circle sits inside a larger link or button and is not a control itself
		decorative?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let { label, href, variant = 'ink', size = 'md', decorative = false, onclick, class: cls = '', ...rest }: Props = $props();
</script>

{#if decorative}
	<span class="arrow {variant} {size} {cls}" aria-hidden="true" {...rest}><Icon name="arrow-right" size={size === 'sm' ? 16 : 19} /></span>
{:else if href}
	<a class="arrow {variant} {size} {cls}" {href} aria-label={label} {...rest}><Icon name="arrow-right" size={size === 'sm' ? 16 : 19} /></a>
{:else}
	<button class="arrow {variant} {size} {cls}" type="button" aria-label={label} {onclick} {...rest}><Icon name="arrow-right" size={size === 'sm' ? 16 : 19} /></button>
{/if}

<style>
	.arrow {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: var(--control);
		block-size: var(--control);
		border: 0;
		border-radius: var(--r-pill);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.sm {
		inline-size: 36px;
		block-size: 36px;
	}

	.ink {
		background: var(--ink);
		color: var(--surface);
	}

	.light {
		background: var(--surface);
		color: var(--ink);
	}

	.accent {
		background: var(--accent);
		color: var(--accent-ink);
	}

	a.arrow:hover,
	button.arrow:hover {
		transform: translateX(2px);
	}

	button.arrow:active {
		transform: scale(0.94);
	}
</style>
