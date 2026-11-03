<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import type { FolderTile } from '#lib/types.ts';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { folder }: { folder: FolderTile } = $props();

	const TINTS = ['accent', 'stone', 'sand'];
	const tint = $derived(TINTS[folder.id % TINTS.length]);
</script>

<a class="tile" class:cover={folder.coverImageId !== null} data-folder-tile data-tint={folder.coverImageId === null ? tint : undefined} href="/folders/{folder.id}">
	{#if folder.coverImageId !== null}
		<img src="/images/{folder.coverImageId}" alt="" loading="lazy" />
		<GlassPanel class="label">
			<span class="name" data-tile-name>{folder.name}</span>
			<span class="count tnum" data-tile-count>{COPY.noteCount(folder.noteCount)}</span>
		</GlassPanel>
	{:else}
		<span class="name display-name" data-tile-name>{folder.name}</span>
		<span class="foot"><span class="count tnum" data-tile-count>{COPY.noteCount(folder.noteCount)}</span><Icon name="arrow-right" size={18} /></span>
	{/if}
</a>

<style>
	.tile {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		aspect-ratio: 16 / 11;
		overflow: hidden;
		padding: var(--s-4);
		border-radius: var(--r-xl);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		color: var(--ink);
		isolation: isolate;
		text-decoration: none;
		transition: transform var(--d-base) var(--ease-out);
	}

	.tile:not(.cover) {
		justify-content: space-between;
	}

	img {
		position: absolute;
		inset: 0;
		z-index: -1;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transition: transform var(--d-glide) var(--ease-out);
	}

	:global(.tile .label) {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0 var(--s-3);
		padding: var(--s-2) var(--s-3);
		border-radius: var(--r-lg);
	}

	.name {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		font-family: var(--font-display);
		font-size: 19px;
		font-weight: 420;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.display-name {
		font-size: 26px;
		letter-spacing: -0.02em;
		line-height: 0.98;
	}

	.count {
		color: var(--ink-2);
		font-size: var(--t-small);
		white-space: nowrap;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	[data-tint='accent'] {
		background: var(--accent-soft);
	}

	[data-tint='stone'] {
		background: var(--stone);
	}

	[data-tint='sand'] {
		background: var(--surface);
		box-shadow: inset 0 0 0 1px var(--line);
	}

	@media (hover: hover) {
		.tile:hover {
			transform: translateY(-2px);
		}

		.tile:hover img {
			transform: scale(1.03);
		}
	}
</style>
