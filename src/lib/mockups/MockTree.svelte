<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import Self from './MockTree.svelte';
	import type { MockTreeFolder } from './fixtures.ts';

	let { items, depth = 0 }: { items: MockTreeFolder[]; depth?: number } = $props();
</script>

<ul class="tree" role={depth === 0 ? 'tree' : 'group'}>
	{#each items as item (item.name)}
		{@const branch = !!(item.children || item.notes)}
		<li role="treeitem" aria-selected={item.current ?? false} aria-expanded={branch ? !!item.open : undefined}>
			<a class="row" class:current={item.current} href="#folder" style:padding-inline-start="{8 + Math.min(depth, 5) * 12}px">
				<span class="chev" class:open={item.open} class:none={!branch}><Icon name="chevron" size={14} /></span>
				<Icon name={item.open ? 'folder-open' : 'folder'} size={18} />
				<span class="name">{item.name}</span>
			</a>
			{#if item.open}
				<ul role="group">
					{#each item.notes ?? [] as note (note.title)}
						<li role="treeitem" aria-selected={note.current ?? false}>
							<a class="row note" class:current={note.current} href="#note" style:padding-inline-start="{8 + (Math.min(depth, 5) + 1) * 12 + 18}px">
								<span class="emoji" aria-hidden="true">{note.icon}</span>
								<span class="name">{note.title}</span>
							</a>
						</li>
					{/each}
				</ul>
				{#if item.children}<Self items={item.children} depth={depth + 1} />{/if}
			{/if}
		</li>
	{/each}
</ul>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 36px;
		padding-inline-end: var(--s-3);
		border-radius: var(--r-md);
		color: var(--ink-2);
		font-size: var(--t-body);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.row:hover {
		background: var(--row-hover);
	}

	.row.current {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
		color: var(--ink);
		font-weight: 600;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chev {
		display: inline-grid;
		place-items: center;
		inline-size: 14px;
		color: var(--ink-2);
		transform: rotate(0deg);
	}

	.chev.open {
		transform: rotate(90deg);
	}

	.chev.none {
		visibility: hidden;
	}

	.note {
		font-size: var(--t-small);
	}

	.emoji {
		inline-size: 18px;
		text-align: center;
	}
</style>
