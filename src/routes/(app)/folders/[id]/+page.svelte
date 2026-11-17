<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '#lib/components/button/Button.svelte';
	import { COPY } from '#lib/copy.ts';
	import { renameFolder } from '#lib/folders/api.ts';
	import FolderHeader from '#lib/folders/FolderHeader.svelte';
	import FolderList from '#lib/folders/FolderList.svelte';
	import NoteRows from '#lib/folders/NoteRows.svelte';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import type { Id } from '#lib/types.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const empty = $derived(!data.tiles.length && !data.notes.length);
	let renaming = $state<Id | null>(null);

	async function addFolder() {
		renaming = await newFolder(data.folder.id);
		await invalidateAll();
	}

	async function rename(id: Id, name: string) {
		renaming = null;
		await renameFolder(id, name);
	}
</script>

<svelte:head><title>{data.folder.name} · Notes Archive</title></svelte:head>

<div class="folder-page" data-folder-page>
	<FolderHeader folder={data.folder} crumbs={data.breadcrumb} counts={data.counts} {empty} onadded={(id) => (renaming = id)} />

	<div class="body">
		{#if empty}
			<div class="card empty">
				<h2>{COPY.emptyFolder}</h2>
				<p>Start a note in this folder, or add a folder inside it.</p>
				<div class="row">
					<Button onclick={() => newNote(data.folder.id)}><Icon name="plus" size={18} />{COPY.newNote}</Button>
					<Button onclick={addFolder}><Icon name="folderPlus" size={18} />{COPY.newFolder}</Button>
				</div>
			</div>
		{/if}

		{#if data.tiles.length}
			<div class="group" data-subfolders>
				<h2 class="ruled">{COPY.folders}</h2>
				<FolderList folders={data.tiles} {renaming} onrename={rename} oncancel={() => (renaming = null)} />
			</div>
		{/if}

		{#if data.notes.length}
			<div class="group" data-notes>
				<h2 class="ruled">Notes</h2>
				<NoteRows notes={data.notes} />
			</div>
		{/if}
	</div>
</div>

<style>
	.folder-page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		min-inline-size: 0;
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		max-inline-size: 48rem;
	}

	.group {
		display: grid;
		gap: var(--space-3);
	}

	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-7);
		background: var(--surface-raised);
		box-shadow: var(--shadow-lift);
	}

	.empty h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}

	.empty p {
		color: var(--ink-secondary);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-3);
	}
</style>
