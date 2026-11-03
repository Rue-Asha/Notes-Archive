<script lang="ts">
	import type { FolderTile as Tile } from '#lib/types.ts';
	import FolderTile from './FolderTile.svelte';

	let { tiles }: { tiles: Tile[] } = $props();
</script>

<div class="grid" data-folder-grid>
	{#each tiles as folder (folder.id)}<FolderTile {folder} />{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: var(--s-4);
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	}

	@media (min-width: 768px) {
		.grid {
			gap: var(--s-5);
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		}
	}
</style>
