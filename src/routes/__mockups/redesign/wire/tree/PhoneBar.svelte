<script lang="ts">
	import Icon from './Icon.svelte';
	import { link } from './data.ts';

	let { current = null, worst = false, flow = false }: { current?: 'home' | 'folders' | 'search' | null; worst?: boolean; flow?: boolean } = $props();
	const pills = [
		{ slug: 'home', key: 'home', label: 'Home' },
		{ slug: 'folders', key: 'folders', label: 'Folders' },
		{ slug: 'search', key: 'search', label: 'Search' }
	] as const;
</script>

<nav class="bar" class:flow aria-label="Bottom bar">
	<ul class="pills">
		{#each pills as p (p.key)}
			<li><a href={link(p.slug, worst)} aria-current={current === p.key ? 'page' : undefined}>{p.label}</a></li>
		{/each}
	</ul>
	<button type="button" class="plus" aria-label="New note"><Icon name="plus" size={22} /></button>
</nav>

<style>
	.bar {
		position: sticky;
		inset-block-end: max(var(--space-2), env(safe-area-inset-bottom));
		z-index: var(--z-rail);
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-block-start: var(--space-3);
	}
	.bar.flow {
		position: static;
		padding: 0;
	}
	.pills {
		display: flex;
		flex: 1;
		min-inline-size: 0;
		gap: var(--space-0-5);
		padding: var(--space-1);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
	}
	.pills li {
		flex: 1;
		min-inline-size: 0;
	}
	.pills a {
		display: grid;
		place-items: center;
		min-block-size: var(--target-touch);
		padding: 0 var(--space-1);
		border-radius: var(--radius-pill);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.pills a[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.plus {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: calc(var(--target-touch) + var(--space-3));
		block-size: calc(var(--target-touch) + var(--space-3));
		padding: 0;
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}
</style>
