<script lang="ts">
	import TreeBranch from './TreeBranch.svelte';
	import Icon from './Icon.svelte';
	import type { MockNoteRef } from '../../fixtures.ts';
	import { link, type WireFolder } from './data.ts';

	type Props = {
		nodes: WireFolder[];
		notes?: MockNoteRef[];
		depth?: number;
		current: number | null;
		open: Set<number>;
		worst: boolean;
		toggle: (id: number) => void;
	};
	let { nodes, notes = [], depth = 0, current, open, worst, toggle }: Props = $props();
</script>

<ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? 'Folders' : undefined} style:--depth={depth}>
	{#each nodes as folder (folder.id)}
		{@const hasKids = folder.children.length > 0 || folder.notes.length > 0}
		{@const expanded = open.has(folder.id)}
		<li role="treeitem" aria-selected="false" aria-expanded={hasKids ? expanded : undefined} tabindex="-1">
			<div class="row">
				{#if hasKids}
					<button type="button" class="chev" aria-label="{expanded ? 'Collapse' : 'Expand'} {folder.name}" aria-expanded={expanded} onclick={() => toggle(folder.id)}>
						<Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
					</button>
				{:else}
					<span class="chev none" aria-hidden="true"></span>
				{/if}
				<a class="name" href={link('folder', worst)} title={folder.name}>
					<Icon name="folder" size={16} />
					<span class="text">{folder.name}</span>
				</a>
			</div>
			{#if hasKids && expanded}
				<TreeBranch nodes={folder.children} notes={folder.notes} depth={depth + 1} {current} {open} {worst} {toggle} />
			{/if}
		</li>
	{/each}
	{#each notes as note (note.id)}
		{@const title = note.title || 'Untitled'}
		<li role="treeitem" aria-selected={note.id === current} tabindex="-1">
			<div class="row">
				<span class="chev none" aria-hidden="true"></span>
				<a class="name note" href={link('note', worst)} title={title} aria-current={note.id === current ? 'page' : undefined}>
					{#if note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{:else}<Icon name="note" size={16} />{/if}
					<span class="text">{title}</span>
				</a>
			</div>
		</li>
	{/each}
</ul>

<style>
	ul {
		display: grid;
		gap: var(--space-0-5);
	}
	li {
		min-inline-size: 0;
	}
	li:focus-visible {
		outline: none;
	}
	.row {
		display: flex;
		align-items: flex-start;
		min-inline-size: 0;
		padding-inline-start: calc(var(--depth) * var(--space-4));
	}
	.chev {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target);
		min-block-size: max(var(--target), 32px);
		padding: 0;
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: var(--ink-secondary);
	}
	.chev.none {
		inline-size: var(--space-3);
	}
	.name {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		flex: 1;
		min-inline-size: 0;
		min-block-size: max(var(--target), 32px);
		padding: var(--space-1-5) var(--space-2);
		border-radius: var(--radius-text);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
	}
	.name :global(svg),
	.emoji {
		flex: none;
		margin-block-start: 1px;
		color: var(--ink-secondary);
	}
	.emoji {
		inline-size: 16px;
		font-size: 14px;
		line-height: 16px;
		text-align: center;
	}
	.text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	.note .text {
		color: var(--ink-secondary);
	}
	.name[aria-current='page'] {
		background: var(--surface-tint-strong);
		color: var(--ink);
		font-weight: var(--weight-semibold);
	}
	.name[aria-current='page'] .text {
		color: var(--ink);
	}
	@media (hover: hover) {
		.name:hover,
		.chev:not(.none):hover {
			background: var(--surface-tint);
		}
	}
</style>
