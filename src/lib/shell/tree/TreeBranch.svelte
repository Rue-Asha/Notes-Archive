<script lang="ts">
	import TreeBranch from './TreeBranch.svelte';
	import Icon from './Icon.svelte';
	import RenameField from './RenameField.svelte';
	import { COPY } from '#lib/copy.ts';
	import { titleLine } from '#lib/title.ts';
	import { live } from '#lib/ui/live.svelte.ts';
	import { arrive, depart, reflow } from '#lib/ui/motion.ts';
	import type { Id, NoteRef, TreeFolder } from '#lib/types.ts';

	type Props = {
		folders: TreeFolder[];
		notes?: NoteRef[];
		depth?: number;
		current: Id | null;
		expanded: (id: Id) => boolean;
		toggle: (id: Id) => void;
		onmenu: (folder: TreeFolder, anchor: HTMLElement) => void;
		renaming: Id | null;
		onrename: (id: Id, name: string) => void;
		oncancel: () => void;
		trail?: string[];
		// the one treeitem in the tab order (roving tabindex), as `f<id>` or `n<id>`
		tabbable: string | null;
	};
	let { folders, notes = [], depth = 0, current, expanded, toggle, onmenu, renaming, onrename, oncancel, trail = [], tabbable }: Props = $props();

	// a branch opened by its chevron shows its rows at once; the top level always lets a new row arrive
	const motion = live();
	const CAP = 3;
	const titleFor = (name: string) => (trail.length > CAP ? [...trail, name].join(' / ') : name);
</script>

<ul role={depth === 0 ? 'tree' : 'group'} aria-label={depth === 0 ? 'Folders' : undefined} style:--depth={depth}>
	{#each folders as folder (folder.id)}
		{@const hasKids = folder.children.length > 0 || folder.notes.length > 0}
		{@const open = expanded(folder.id)}
		<li
			role="treeitem"
			aria-level={depth + 1}
			aria-selected="false"
			aria-expanded={hasKids ? open : undefined}
			aria-label={folder.name}
			data-key="f{folder.id}"
			tabindex={tabbable === `f${folder.id}` ? 0 : -1}
			animate:reflow
			in:arrive|global={{ live: depth === 0 || motion.on }}
			out:depart
		>
			<div class="row">
				{#if depth > CAP}<span class="level" aria-hidden="true">{depth + 1}</span>{/if}
				{#if hasKids}
					<button type="button" class="chev" tabindex="-1" aria-label={open ? COPY.collapse(folder.name) : COPY.expand(folder.name)} aria-expanded={open} onclick={() => toggle(folder.id)}>
						<Icon name="chevronRight" size={14} />
					</button>
				{:else}
					<span class="chev none" aria-hidden="true"></span>
				{/if}
				{#if renaming === folder.id}
					<span class="name editing">
						<Icon name="folder" size={16} />
						<RenameField value={folder.name} focused onsubmit={(n) => onrename(folder.id, n)} {oncancel} />
					</span>
				{:else}
					<a class="name" href="/folders/{folder.id}" tabindex="-1" title={titleFor(folder.name)}>
						<Icon name="folder" size={16} />
						<span class="text" lang="de">{folder.name}</span>
					</a>
					<button type="button" class="more" tabindex="-1" aria-label="{folder.name} menu" aria-haspopup="menu" onclick={(e) => onmenu(folder, e.currentTarget)}>
						<Icon name="more" size={16} />
					</button>
				{/if}
			</div>
			{#if hasKids && open}
				<TreeBranch folders={folder.children} notes={folder.notes} depth={depth + 1} {current} {expanded} {toggle} {onmenu} {renaming} {onrename} {oncancel} {tabbable} trail={[...trail, folder.name]} />
			{/if}
		</li>
	{/each}
	{#each notes as note (note.id)}
		{@const title = titleLine(note.title)}
		<li
			role="treeitem"
			aria-level={depth + 1}
			aria-selected={note.id === current}
			data-key="n{note.id}"
			tabindex={tabbable === `n${note.id}` ? 0 : -1}
			animate:reflow
			in:arrive|global={{ live: depth === 0 || motion.on }}
			out:depart
		>
			<div class="row">
				{#if depth > CAP}<span class="level" aria-hidden="true">{depth + 1}</span>{/if}
				<span class="chev none" aria-hidden="true"></span>
				<a class="name note" href="/notes/{note.id}" tabindex="-1" title={titleFor(title)} aria-current={note.id === current ? 'page' : undefined}>
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
		font-size: var(--type-overline-size);
		line-height: 1;
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
	}
	.chev,
	.more {
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
		.chev,
		.more {
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
	.more {
		opacity: 0;
	}
	.row:focus-within .more {
		opacity: 1;
	}
	@media (hover: hover) and (pointer: fine) {
		.row:hover .more {
			opacity: 1;
		}
	}
	/* without a fine hover the button would never show, so it stays */
	@media not ((hover: hover) and (pointer: fine)) {
		.more {
			opacity: 1;
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
	}
	.name:not([aria-current]):active {
		background: var(--surface-tint-strong);
	}
	@media (hover: hover) {
		.chev:not(.none):hover,
		.more:hover {
			background: var(--surface-hover);
			color: var(--ink);
		}
	}
</style>
