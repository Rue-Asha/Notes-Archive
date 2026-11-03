<script lang="ts">
	import FolderGrid from '#lib/folders/FolderGrid.svelte';
	import NoteGrid from '#lib/notes/NoteGrid.svelte';
	import type { FolderTile, NoteCard } from '#lib/types.ts';

	let { pinned, recent, tiles }: { pinned: NoteCard[]; recent: NoteCard[]; tiles: FolderTile[] } = $props();
</script>

<div class="bento">
	{#if pinned.length}
		<section class="block" aria-labelledby="home-pinned" data-pinned>
			<header><h2 id="home-pinned">Pinned</h2><span class="eyebrow tnum">{String(pinned.length).padStart(2, '0')}</span></header>
			<NoteGrid notes={pinned} />
		</section>
	{/if}
	{#if recent.length}
		<section class="block" aria-labelledby="home-recent" data-recent>
			<header><h2 id="home-recent">Recently edited</h2></header>
			<NoteGrid notes={recent} />
		</section>
	{/if}
	{#if tiles.length}
		<section class="block" aria-labelledby="home-folders" data-folders>
			<header><h2 id="home-folders">Folders</h2></header>
			<FolderGrid {tiles} />
		</section>
	{/if}
</div>

<style>
	.bento {
		display: grid;
		gap: var(--s-9);
	}

	.block {
		display: grid;
		gap: var(--s-5);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.eyebrow {
		font-size: 12px;
		letter-spacing: 0.12em;
	}
</style>
