<script lang="ts">
	import type { Id, Tree, TreeFolder } from '#lib/types.ts';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { folderId, tree, onchange }: { folderId: Id | null; tree: Tree; onchange(folderId: Id | null): void } = $props();

	let open = $state(false);

	function nameOf(folders: TreeFolder[], id: Id): string | undefined {
		for (const f of folders) {
			const hit = f.id === id ? f.name : nameOf(f.children, id);
			if (hit !== undefined) return hit;
		}
	}

	const name = $derived(folderId === null ? 'Root' : (nameOf(tree.folders, folderId) ?? 'Root'));
</script>

<button type="button" class="prop glass" aria-label="Folder: {name}" aria-haspopup="dialog" data-folder-field onclick={() => (open = true)}>
	<Icon name="folder" size={16} /><span class="name">{name}</span>
</button>
<FolderPicker
	{open}
	{tree}
	current={folderId}
	onpick={(id) => {
		open = false;
		if (id !== folderId) onchange(id);
	}}
	oncancel={() => (open = false)}
/>

<style>
	.name {
		max-inline-size: 22ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
