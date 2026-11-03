<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Breadcrumb from '#lib/folders/Breadcrumb.svelte';
	import FolderGrid from '#lib/folders/FolderGrid.svelte';
	import FolderHeader from '#lib/folders/FolderHeader.svelte';
	import NoteGrid from '#lib/notes/NoteGrid.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{data.folder.name} · Notes Archive</title></svelte:head>

<div class="folder-page" data-folder-page>
	<Breadcrumb crumbs={data.breadcrumb} />
	<FolderHeader folder={data.folder} folders={data.counts.folders} notes={data.counts.notes} />
	{#if data.tiles.length}
		<section class="block" data-subfolders>
			<header><h2>Folders</h2><span class="eyebrow tnum">{data.tiles.length}</span></header>
			<FolderGrid tiles={data.tiles} />
		</section>
	{/if}
	{#if data.notes.length}
		<section class="block" data-notes>
			<header><h2>Notes</h2><span class="sort">Last edited</span></header>
			<NoteGrid notes={data.notes} />
		</section>
	{/if}
	{#if !data.tiles.length && !data.notes.length}
		<p class="empty">{COPY.emptyFolder}</p>
	{/if}
</div>

<style>
	.folder-page {
		display: grid;
		gap: var(--s-8);
	}

	.block {
		display: grid;
		gap: var(--s-5);
	}

	.block > header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.sort {
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 600;
	}

	.empty {
		color: var(--ink-2);
		text-align: center;
	}
</style>
