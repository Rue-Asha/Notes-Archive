<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { LOOK } from '#lib/styles/look.ts';
	import { accents, cards, glasses } from '#lib/styles/tokens.ts';

	let { children }: { children: Snippet } = $props();

	const axes = { accent: Object.keys(accents), glass: Object.keys(glasses), card: Object.keys(cards) } as const;

	// the look lives in three attributes on <html>; a query overrides what look.ts put there
	$effect(() => {
		for (const axis of Object.keys(axes) as (keyof typeof axes)[]) {
			const value = page.url.searchParams.get(axis);
			if (value && axes[axis].includes(value)) document.documentElement.dataset[axis] = value;
		}
	});

	const current = (axis: keyof typeof axes) => page.url.searchParams.get(axis) ?? LOOK[axis];

	function href(axis: string, value: string): string {
		const q = new URLSearchParams(page.url.search);
		q.set(axis, value);
		return `?${q}`;
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

{@render children()}

{#if !page.url.searchParams.has('bare')}
	<details class="look glass" data-look-switch>
		<summary>Look</summary>
		{#each Object.entries(axes) as [axis, values] (axis)}
			<div class="axis">
				<span class="eyebrow">{axis}</span>
				{#each values as value (value)}
					<a href={href(axis, value)} aria-current={current(axis as keyof typeof axes) === value ? 'true' : undefined} data-sveltekit-replacestate data-sveltekit-noscroll>{value}</a>
				{/each}
			</div>
		{/each}
	</details>
{/if}

<style>
	.look {
		position: fixed;
		z-index: 60;
		inset-block-end: calc(var(--s-4) + env(safe-area-inset-bottom));
		inset-inline-end: var(--s-4);
		padding: var(--s-2) var(--s-3);
		border-radius: var(--r-lg);
		font-size: var(--t-small);
	}

	@media (max-width: 1023px) {
		.look {
			inset-block-end: auto;
			inset-block-start: var(--s-2);
			inset-inline-end: var(--s-2);
		}
	}

	summary {
		cursor: pointer;
		font-weight: 600;
		padding-block: var(--s-1);
	}

	.axis {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-1) var(--s-3);
		padding-block: var(--s-1);
	}

	.axis .eyebrow {
		inline-size: 56px;
	}

	a[aria-current='true'] {
		font-weight: 700;
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-underline-offset: 4px;
	}
</style>
