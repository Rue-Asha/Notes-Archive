<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		as?: 'div' | 'section' | 'aside' | 'header' | 'nav' | 'article';
		strong?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'>;

	let { children, as = 'div', strong = false, class: cls = '', ...rest }: Props = $props();
</script>

<svelte:element this={as} class="glass panel {cls}" class:strong {...rest}>{@render children()}</svelte:element>

<style>
	.panel {
		border-radius: var(--r-xl);
	}

	/* where body text sits on it: nearly the solid fallback, still frosted */
	.strong {
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}
</style>
