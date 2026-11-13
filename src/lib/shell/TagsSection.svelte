<script lang="ts">
	import type { TagCount } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { tags }: { tags: TagCount[] } = $props();
</script>

{#if tags.length}
	<section aria-label="Tags">
		<h2 class="eyebrow section-head">Tags</h2>
		<ul class="tags">
			{#each tags as tag (tag.id)}
				<li>
					<a href="/tags/{tag.id}"><Icon name="tag" size={16} /><span class="name">{tag.name}</span><span class="count tnum">{tag.count}</span></a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.section-head {
		padding-inline: var(--s-2) var(--s-1);
		margin-block-end: var(--s-1);
		font-family: var(--font-text);
	}

	a {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-2);
		border-radius: var(--r-md);
		color: var(--ink-2);
	}

	a:hover {
		background: var(--row-hover);
	}

	.name {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.count {
		font-size: var(--t-small);
	}
</style>
