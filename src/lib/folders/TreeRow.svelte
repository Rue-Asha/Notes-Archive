<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { titleLine } from '#lib/title.ts';
	import type { NoteRef, TreeFolder } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { indentLevel } from './tree.ts';

	type Props = {
		item: TreeFolder | NoteRef;
		level: number;
		expanded?: boolean;
		current: boolean;
		onnavigate?(): void;
		ontoggle?(): void;
		onmenu?(anchor: HTMLElement): void;
		renaming?: boolean;
		onrename?(name: string): void;
		oncancel?(): void;
	};

	let { item, level, expanded = false, current, onnavigate, ontoggle, onmenu, renaming = false, onrename, oncancel }: Props = $props();

	const folder = $derived('children' in item ? item : null);
	const name = $derived('children' in item ? item.name : titleLine(item.title));
	const branch = $derived(!!folder && (folder.children.length > 0 || folder.notes.length > 0));
	const icon = $derived('icon' in item ? item.icon : null);

	let finished = false;

	function focusSelect(node: HTMLInputElement) {
		finished = false;
		node.focus();
		node.select();
	}

	function commit(event: Event) {
		if (finished) return;
		finished = true;
		onrename?.((event.currentTarget as HTMLInputElement).value);
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Enter') (event.currentTarget as HTMLInputElement).blur();
		if (event.key === 'Escape') {
			// the drawer would close on the same key
			event.stopPropagation();
			finished = true;
			oncancel?.();
		}
	}
</script>

<div class="row" class:note={!folder} class:current style:padding-inline-start="{6 + (indentLevel(level) - 1) * 12}px">
	{#if folder}
		<button class="chev" class:open={expanded} class:none={!branch} type="button" tabindex={branch ? 0 : -1} aria-label="{expanded ? 'Collapse' : 'Expand'} {name}" aria-expanded={branch ? expanded : undefined} onclick={ontoggle}>
			<Icon name="chevron" size={14} />
		</button>
	{:else}
		<span class="chev none"></span>
	{/if}
	{#if renaming}
		<span class="link">
			<Icon name="folder" size={18} />
			<input class="rename" type="text" aria-label="Folder name" value={name} use:focusSelect onblur={commit} onkeydown={keys} />
		</span>
	{:else}
		<a class="link" href={folder ? `/folders/${item.id}` : `/notes/${item.id}`} title={name} aria-current={current ? 'page' : undefined} onclick={onnavigate}>
			{#if folder}
				<Icon name={expanded ? 'folder-open' : 'folder'} size={18} />
			{:else}
				<span class="emoji" aria-hidden="true">{icon}</span>
			{/if}
			<span class="name">{name}</span>
		</a>
	{/if}
	{#if folder}
		<button class="more" type="button" aria-label="{name} menu" aria-haspopup="menu" onclick={(e) => onmenu?.(e.currentTarget)}>
			<Icon name="more" size={18} />
		</button>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		min-block-size: 36px;
		padding-inline-end: var(--s-1);
		border-radius: var(--r-md);
		color: var(--ink-2);
		font-size: var(--t-body);
	}

	.row.note {
		font-size: var(--t-small);
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

	.chev {
		display: inline-grid;
		flex: none;
		place-items: center;
		inline-size: 22px;
		block-size: 28px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink-2);
		transition: transform var(--d-fast) var(--ease-out);
	}

	.chev.open {
		transform: rotate(90deg);
	}

	.chev.none {
		visibility: hidden;
	}

	.link {
		display: flex;
		flex: 1;
		align-items: center;
		gap: var(--s-2);
		min-inline-size: 0;
		min-block-size: 36px;
	}

	.name {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.more {
		display: inline-grid;
		flex: none;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
		opacity: 0;
	}

	.row:hover .more,
	.row:focus-within .more {
		opacity: 1;
	}

	@media (hover: none) {
		.more {
			opacity: 1;
		}
	}

	.rename {
		flex: 1;
		min-inline-size: 0;
		padding: 2px var(--s-2);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
	}

	.emoji {
		display: inline-block;
		inline-size: 18px;
		text-align: center;
	}
</style>
