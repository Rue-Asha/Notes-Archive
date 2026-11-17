<script lang="ts">
	import { page } from '$app/state';
	import type { TagCount } from '#lib/types.ts';

	// the sidebar lists the tags as rows; the Folders page lays them out as chips
	let { tags, chips = false }: { tags: TagCount[]; chips?: boolean } = $props();

	const uid = $props.id();
</script>

{#if tags.length}
	<section class="tags" class:chips aria-labelledby="{uid}-tags">
		<div class="head"><h2 class="ruled" id="{uid}-tags">Tags</h2><span class="n">{tags.length.toLocaleString('en')}</span></div>
		<ul>
			{#each tags as tag (tag.id)}
				<li>
					<a href="/tags/{tag.id}" title={tag.name} data-press aria-current={page.url.pathname === `/tags/${tag.id}` ? 'page' : undefined}><span class="name">{tag.name}</span><span class="count">{tag.count}</span></a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.tags {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-block-size: 0;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--space-1);
	}

	.n {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		min-block-size: max(var(--space-8), var(--target));
		padding-inline: var(--space-3);
		border-radius: var(--radius-pill);
		color: var(--ink);
		text-decoration: none;
	}

	.name {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.count {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}

	a[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-weight: var(--weight-semibold);
	}

	a[aria-current] .count {
		color: var(--ink-on-inverse-secondary);
	}

	a[aria-current]:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}

	/* chips: glass pills that wrap, the count after the name */
	.chips {
		gap: var(--space-3);
	}

	.chips .head {
		justify-content: flex-start;
	}

	.chips ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.chips li {
		max-inline-size: 100%;
	}

	.chips a {
		justify-content: flex-start;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
	}

	@media (hover: hover) {
		a:not([aria-current]):hover {
			background: var(--surface-hover);
		}

		.chips a:not([aria-current]):hover {
			background: var(--surface-raised);
		}
	}
</style>
