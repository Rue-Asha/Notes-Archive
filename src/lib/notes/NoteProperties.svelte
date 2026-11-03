<script lang="ts">
	import type { Note, NotePatch, TagCount, Tree } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import FolderField from './FolderField.svelte';
	import TagInput from './TagInput.svelte';

	let { note, tree, tags, onchange }: { note: Note; tree: Tree; tags: TagCount[]; onchange(patch: NotePatch): void } = $props();
</script>

<div class="props" data-properties role="group" aria-label="Properties">
	<FolderField folderId={note.folderId} {tree} onchange={(folderId) => onchange({ folderId })} />
	<TagInput selected={note.tags.map((t) => t.name)} known={tags} onchange={(names) => onchange({ tags: names })} />
	<button type="button" class="prop glass pin" role="switch" aria-checked={note.pinned} onclick={() => onchange({ pinned: !note.pinned })}>
		<Icon name="pin" size={16} />Pinned
	</button>
</div>

<style>
	.props {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	/* the chips of Folder, Tags and Pinned: one look, whichever component draws them */
	.props :global(.prop) {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-3);
		border-radius: var(--r-pill);
		color: var(--ink);
		font-size: var(--t-small);
		font-weight: 500;
	}

	.props :global(button.prop) {
		border: 0;
		cursor: pointer;
	}

	.pin[aria-checked='false'] {
		color: var(--ink-2);
	}

	.pin[aria-checked='true'] {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
		color: var(--ink);
	}
</style>
