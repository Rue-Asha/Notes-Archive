<script lang="ts">
	import type { Id, TagCount, Tree, TreeFolder } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	type Props = {
		tree: Tree;
		tags: TagCount[];
		folderId?: Id | null;
		tagId?: Id | null;
		onchange(change: { folderId: Id | null } | { tagId: Id | null }): void;
	};

	let { tree, tags, folderId = null, tagId = null, onchange }: Props = $props();

	// "Reisen / Japan": a sub-folder's name alone says little in a flat list
	const folders = $derived.by(() => {
		const rows: { id: Id; label: string }[] = [];
		const walk = (list: TreeFolder[], prefix: string) => {
			for (const f of list) {
				rows.push({ id: f.id, label: prefix + f.name });
				walk(f.children, `${prefix}${f.name} / `);
			}
		};
		walk(tree.folders, '');
		return rows;
	});

	const id = (value: string): Id | null => (value ? Number(value) : null);
	const folderText = $derived(folders.find((row) => row.id === folderId)?.label ?? 'Any folder');
	const tagText = $derived(tags.find((tag) => tag.id === tagId)?.name ?? 'Any tag');
</script>

<!-- the pill shows the hi-fi's compact label and value; the native select lies over it, invisible, at 16 px so a tap
     opens the system picker without iOS zooming the page -->
<label class="seg filter" class:active={folderId != null}>
	<Icon name="folder" size={18} />
	<span class="seg-text">
		<span class="seg-label">Folder</span>
		<span class="seg-value value" aria-hidden="true">{folderText}</span>
	</span>
	<span class="chev"><Icon name="chevron" size={16} /></span>
	<select aria-label="Folder" value={folderId ?? ''} onchange={(e) => onchange({ folderId: id(e.currentTarget.value) })}>
		<option value="">Any folder</option>
		{#each folders as row (row.id)}<option value={row.id}>{row.label}</option>{/each}
	</select>
</label>
<label class="seg filter" class:active={tagId != null}>
	<Icon name="tag" size={18} />
	<span class="seg-text">
		<span class="seg-label">Tag</span>
		<span class="seg-value value" lang="de" aria-hidden="true">{tagText}</span>
	</span>
	<span class="chev"><Icon name="chevron" size={16} /></span>
	<select aria-label="Tag" value={tagId ?? ''} onchange={(e) => onchange({ tagId: id(e.currentTarget.value) })}>
		<option value="">Any tag</option>
		{#each tags as tag (tag.id)}<option value={tag.id}>{tag.name}</option>{/each}
	</select>
</label>

<style>
	.filter {
		position: relative;
		flex: 0 1 13rem;
		min-inline-size: 0;
		padding-inline: var(--space-4) var(--space-3);
		border-radius: var(--radius-pill);
		color: var(--ink);
		box-shadow: none;
	}

	.filter:has(select:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.seg-text {
		flex: 1;
	}

	.value {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	select {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		opacity: 0;
		appearance: none;
		-webkit-appearance: none;
		border-radius: inherit;
		/* iOS zooms the page into any field under 16 px */
		font-size: max(16px, var(--type-body-size));
		cursor: pointer;
	}

	/* the chevron points right in the icon set; turned down it reads as a picker */
	.chev {
		display: inline-flex;
		flex: none;
		color: var(--ink-secondary);
		transform: rotate(90deg);
		pointer-events: none;
	}

	.active {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.active :global(svg),
	.active .chev {
		color: var(--ink-on-inverse);
	}

	.active .value {
		color: var(--ink-on-inverse);
		font-weight: var(--weight-medium);
	}

	@media (hover: hover) {
		.filter:not(.active):hover {
			background: var(--surface-tint);
		}

		.active:hover {
			background: var(--surface-inverse-hover);
		}
	}

	/* below the wide layout the query takes the first row and the two filters share the second */
	@media (max-width: 1099px) {
		.filter {
			flex: 1 1 10rem;
		}
	}

	@media (max-width: 767px) {
		.filter {
			flex: 1 1 8rem;
			padding-inline: var(--space-3) var(--space-2);
		}
	}
</style>
