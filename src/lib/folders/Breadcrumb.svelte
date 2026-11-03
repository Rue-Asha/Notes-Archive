<script lang="ts">
	import type { Crumb } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="crumbs" aria-label="Breadcrumb">
	{#each crumbs.slice(0, -1) as crumb (crumb.id)}
		<a href="/folders/{crumb.id}">{crumb.name}</a><Icon name="chevron" size={14} />
	{/each}
	<span aria-current="page">{crumbs.at(-1)?.name}</span>
</nav>

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	a {
		color: inherit;
		overflow-wrap: anywhere;
		text-decoration: none;
	}

	a:hover {
		color: var(--ink);
		text-decoration: underline;
	}

	span {
		color: var(--ink);
		font-weight: 600;
		overflow-wrap: anywhere;
	}
</style>
