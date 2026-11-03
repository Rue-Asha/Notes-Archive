<script lang="ts">
	import type { Id, TagCount, Tree, TreeFolder } from '#lib/types.ts';

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
</script>

<div class="filters" data-search-filters>
	<label>
		<span class="eyebrow">Folder</span>
		<select aria-label="Folder" value={folderId ?? ''} onchange={(e) => onchange({ folderId: id(e.currentTarget.value) })}>
			<option value="">Any folder</option>
			{#each folders as row (row.id)}<option value={row.id}>{row.label}</option>{/each}
		</select>
	</label>
	<label>
		<span class="eyebrow">Tag</span>
		<select aria-label="Tag" value={tagId ?? ''} onchange={(e) => onchange({ tagId: id(e.currentTarget.value) })}>
			<option value="">Any tag</option>
			{#each tags as tag (tag.id)}<option value={tag.id}>{tag.name}</option>{/each}
		</select>
	</label>
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
	}

	label {
		display: grid;
		flex: 1 1 200px;
		max-inline-size: 320px;
		gap: var(--s-1);
	}

	@media (max-width: 599px) {
		label {
			max-inline-size: none;
		}
	}

	select {
		min-block-size: var(--control);
		padding-inline: var(--s-4);
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		background: var(--chip-bg);
		color: inherit;
		font: inherit;
		text-overflow: ellipsis;
	}
</style>
