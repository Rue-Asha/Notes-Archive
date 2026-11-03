<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import type { Folder } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import CoverControl from './CoverControl.svelte';

	let { folder, folders, notes }: { folder: Folder; folders: number; notes: number } = $props();

	async function addFolder() {
		await newFolder(folder.id);
		await invalidateAll();
	}
</script>

<header class="cover" class:plain={folder.coverImageId === null} data-cover-header>
	{#if folder.coverImageId !== null}<img src="/images/{folder.coverImageId}" alt="" />{/if}
	<GlassPanel as="div" strong class="title-panel">
		<Eyebrow>Folder</Eyebrow>
		<h1 class="display">{folder.name}</h1>
		<p class="counts tnum" data-folder-counts>{COPY.folderCounts(folders, notes)}</p>
	</GlassPanel>
	<div class="side">
		<CoverControl folderId={folder.id} hasCover={folder.coverImageId !== null} />
		<GlassPanel as="div" class="actions">
			<Button onclick={() => newNote(folder.id)}>{COPY.newNote}</Button>
			<Button variant="secondary" onclick={addFolder}>{COPY.newFolder}</Button>
		</GlassPanel>
	</div>
</header>

<style>
	.cover {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-start;
		gap: var(--s-3);
		min-block-size: 300px;
		padding: var(--s-4);
		overflow: hidden;
		border-radius: var(--r-2xl);
		isolation: isolate;
		box-shadow: var(--shadow-card);
	}

	.plain {
		min-block-size: 0;
		background: var(--accent-soft);
	}

	@media (min-width: 768px) {
		.cover {
			display: grid;
			grid-template-columns: minmax(0, auto) auto;
			align-items: end;
			justify-content: space-between;
			min-block-size: 380px;
			padding: var(--s-6);
		}

		.plain {
			min-block-size: 0;
		}
	}

	img {
		position: absolute;
		inset: 0;
		z-index: -1;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: 50% 28%;
	}

	:global(.title-panel) {
		display: grid;
		gap: var(--s-2);
		max-inline-size: 100%;
		padding: var(--s-5) var(--s-6);
		border-radius: var(--r-2xl);
	}

	:global(.title-panel h1) {
		font-size: var(--t-display-2);
		overflow-wrap: anywhere;
	}

	.counts {
		color: var(--ink-2);
	}

	.side {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-3);
	}

	@media (min-width: 768px) {
		.side {
			align-items: flex-end;
		}
	}

	:global(.cover .actions) {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
		padding: var(--s-3);
		border-radius: var(--r-pill);
	}
</style>
