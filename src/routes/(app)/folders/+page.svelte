<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import { COPY, count } from '#lib/copy.ts';
	import { createFolder, renameFolder } from '#lib/folders/api.ts';
	import FolderList from '#lib/folders/FolderList.svelte';
	import { noteTotal } from '#lib/folders/tree.ts';
	import SortMenu from '#lib/shell/SortMenu.svelte';
	import TagList from '#lib/shell/TagList.svelte';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import type { Id, TagCount, Tree } from '#lib/types.ts';

	const tree = $derived(page.data.tree as Tree);
	const tags = $derived(page.data.tags as TagCount[]);
	const rows = $derived(tree.folders.map((f) => ({ id: f.id, name: f.name, noteCount: noteTotal(f) })));
	const notes = $derived(rows.reduce((sum, row) => sum + row.noteCount, 0));

	let renaming = $state<Id | null>(null);

	async function add() {
		renaming = await createFolder(null);
	}

	async function rename(id: Id, name: string) {
		renaming = null;
		await renameFolder(id, name);
	}
</script>

<svelte:head><title>Folders · Notes Archive</title></svelte:head>

<div class="page">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Notes Archive</li></ul>
			<h1>All <em class="accent-word">folders</em></h1>
			{#if rows.length}
				<p class="lede">{count(rows.length, 'folder')} · {COPY.noteCount(notes)}</p>
				<div class="actions">
					<Button variant="glass" onclick={add}><Icon name="folderPlus" size={18} /><span>{COPY.newFolder}</span></Button>
					<SortMenu placement="tree" glass />
				</div>
			{/if}
		</div>
	</header>

	<div class="body">
		{#if rows.length}
			<FolderList folders={rows} {renaming} onrename={rename} oncancel={() => (renaming = null)} />
		{:else}
			<EmptyState title={COPY.noFolders} body="Folders keep related notes together.">
				{#snippet action()}<Button onclick={add}><Icon name="folderPlus" size={18} />{COPY.newFolder}</Button>{/snippet}
			</EmptyState>
		{/if}

		<div class="tags"><TagList {tags} chips /></div>
	</div>
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-6);
		min-inline-size: 0;
	}

	.screen-head {
		padding-block: 0;
	}

	.screen-lead::before {
		content: none;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-block-start: var(--space-1);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		max-inline-size: 44rem;
	}

	/* the sidebar already carries the tags, and a second "Tags" region would be a duplicate landmark */
	@media (min-width: 1024px) {
		.tags {
			display: none;
		}
	}

</style>
