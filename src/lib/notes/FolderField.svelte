<script lang="ts" module>
	// a deep path keeps its first and last folder; the full path stays in the button's name
	export const shortPath = (path: string[]): string => (path.length > 3 ? [path[0], '…', path.at(-1)].join(' / ') : path.join(' / '));
</script>

<script lang="ts">
	import Icon from '#lib/shell/tree/Icon.svelte';
	import type { Id, Tree } from '#lib/types.ts';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';

	let { folderId, path, tree, onchange }: { folderId: Id | null; path: string[]; tree: Tree; onchange(folderId: Id | null): void } = $props();

	let open = $state(false);

	const full = $derived(path.length ? path.join(' / ') : 'Root');
</script>

<button type="button" class="seg pick" aria-label="Folder: {full}" title={full} aria-haspopup="dialog" data-folder-field data-press onclick={() => (open = true)}>
	<Icon name="folder" size={18} />
	<span class="seg-text"><span class="seg-label">Folder</span><span class="seg-value path">{path.length ? shortPath(path) : 'Root'}</span></span>
	<Icon name="chevronDown" size={14} />
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
	.path {
		display: -webkit-box;
		overflow: hidden;
		overflow-wrap: anywhere;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
</style>
