<script lang="ts">
	import TreeBranch from './TreeBranch.svelte';
	import Icon from './Icon.svelte';
	import RenameField from './RenameField.svelte';
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
		trail?: string[];
		renaming?: number | null;
		names?: Record<number, string>;
		rename?: (id: number, name: string | null) => void;
	};
	let { nodes, notes = [], depth = 0, current, open, worst, toggle, trail = [], renaming = null, names = {}, rename }: Props = $props();

	const CAP = 3;
	const titleFor = (path: string[], name: string) => (path.length > CAP ? [...path, name].join(' / ') : name);
	const first = (kind: 'folder' | 'note') => depth === 0 && (kind === 'folder' ? nodes.length > 0 : nodes.length === 0);
</script>

<ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? 'Folders' : undefined} style:--depth={depth}>
	{#each nodes as folder, i (folder.id)}
		{@const hasKids = folder.children.length > 0 || folder.notes.length > 0}
		{@const expanded = open.has(folder.id)}
		<li role="treeitem" aria-level={depth + 1} aria-selected="false" aria-expanded={hasKids ? expanded : undefined} tabindex={first('folder') && i === 0 ? 0 : -1}>
			<div class="row">
				{#if depth > CAP}<span class="level" aria-hidden="true">{depth + 1}</span>{/if}
				{#if hasKids}
					<button type="button" class="chev" tabindex="-1" aria-label="{expanded ? 'Collapse' : 'Expand'} {folder.name}" aria-expanded={expanded} onclick={() => toggle(folder.id)}>
						<Icon name="chevronRight" size={14} />
					</button>
				{:else}
					<span class="chev none" aria-hidden="true"></span>
				{/if}
				{#if renaming === folder.id}
					<span class="name editing">
						<Icon name="folder" size={16} />
						<RenameField value={names[folder.id] ?? folder.name} focused onsubmit={(n) => rename?.(folder.id, n)} oncancel={() => rename?.(folder.id, null)} />
					</span>
				{:else}
					<a class="name" href={link('folder', worst)} tabindex="-1" title={titleFor(trail, names[folder.id] ?? folder.name)}>
						<Icon name="folder" size={16} />
						<span class="text" lang="de">{names[folder.id] ?? folder.name}</span>
					</a>
				{/if}
			</div>
			{#if hasKids && expanded}
				<TreeBranch nodes={folder.children} notes={folder.notes} depth={depth + 1} {current} {open} {worst} {toggle} trail={[...trail, folder.name]} {renaming} {names} {rename} />
			{/if}
		</li>
	{/each}
	{#each notes as note, i (note.id)}
		{@const title = note.title || 'Untitled'}
		<li role="treeitem" aria-level={depth + 1} aria-selected={note.id === current} tabindex={first('note') && i === 0 ? 0 : -1}>
			<div class="row">
				{#if depth > CAP}<span class="level" aria-hidden="true">{depth + 1}</span>{/if}
				<span class="chev none" aria-hidden="true"></span>
				<a class="name note" href={link('note', worst)} tabindex="-1" title={titleFor(trail, title)} aria-current={note.id === current ? 'page' : undefined}>
					{#if note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{:else}<Icon name="note" size={16} />{/if}
					<span class="text">{title}</span>
				</a>
			</div>
		</li>
	{/each}
</ul>

<style>
	ul {
		--row-h: 34px;
		--step: var(--space-3-5);
		--step-deep: var(--space-1);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	@media (pointer: coarse) {
		ul {
			--row-h: var(--target-touch);
		}
	}
	li {
		min-inline-size: 0;
	}
	li:focus-visible {
		outline: none;
	}
	li:focus-visible > .row > .name {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}
	li:focus-visible > .row > .name[aria-current] {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	.row {
		--indent: calc(min(var(--depth), 3) * var(--step) + min(max(var(--depth) - 3, 0), 6) * var(--step-deep));
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: var(--space-0-5);
		min-inline-size: 0;
		padding-inline-start: var(--indent);
	}
	.level {
		position: absolute;
		inset-inline-start: calc(var(--indent) - var(--space-5));
		inset-block-start: calc((var(--row-h) - 18px) / 2);
		display: grid;
		place-items: center;
		min-inline-size: 18px;
		block-size: 18px;
		padding-inline: 3px;
		border-radius: var(--radius-pill);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
		font-size: 10px;
		line-height: 1;
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.chev {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--target-min);
		block-size: var(--row-h);
		padding: 0;
		border: 0;
		border-radius: var(--radius-pill);
		background: none;
		color: var(--ink-secondary);
	}
	@media (pointer: coarse) {
		.chev {
			inline-size: var(--target-touch);
		}
	}
	.chev[aria-expanded='true'] :global(svg) {
		rotate: 90deg;
	}
	.chev.none {
		inline-size: var(--space-3);
	}
	@media (pointer: coarse) {
		.chev.none {
			inline-size: var(--space-2);
		}
	}
	.name {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		flex: 1;
		min-inline-size: 0;
		min-block-size: var(--row-h);
		padding: calc((var(--row-h) - 20px) / 2) var(--space-2-5);
		border-radius: var(--radius-item);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-body-s-size);
		line-height: 20px;
	}
	.name.editing {
		align-items: center;
		padding-block: var(--space-0-5);
		padding-inline-start: var(--space-2-5);
		padding-inline-end: var(--space-1-5);
	}
	.name :global(svg) {
		flex: none;
		margin-block-start: var(--space-0-5);
		color: var(--ink-secondary);
	}
	.editing :global(svg) {
		margin-block-start: 0;
	}
	.emoji {
		flex: none;
		inline-size: 16px;
		font-size: 14px;
		text-align: center;
	}
	.text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	.name[aria-current='page'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.name[aria-current='page'] :global(svg) {
		color: var(--ink-on-inverse-secondary);
	}
	@media (hover: hover) {
		.name:not([aria-current]):hover {
			background: var(--surface-hover);
		}
		.chev:not(.none):hover {
			background: var(--surface-hover);
			color: var(--ink);
		}
	}
</style>
