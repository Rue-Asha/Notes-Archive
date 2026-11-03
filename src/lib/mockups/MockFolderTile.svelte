<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import { photo, type MockFolder } from './fixtures.ts';

	let { folder, index, total, small = false }: { folder: MockFolder; index: number; total: number; small?: boolean } = $props();

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<a class="tile" class:small class:cover={folder.cover} data-folder-tile data-tint={folder.tint ?? undefined} href="#folder-{folder.id}">
	{#if folder.cover}
		<img src={photo(folder.cover)} alt="" style:object-position={folder.position} loading="eager" />
	{/if}
	<span class="counter eyebrow tnum">{pad(index + 1)} / {pad(total)}</span>
	{#if folder.cover}
		<GlassPanel class="label">
			<span class="name">{folder.name}</span>
			<span class="count tnum">{folder.notes} notes</span>
		</GlassPanel>
	{:else}
		<span class="name display-name">{folder.name}</span>
		<span class="foot"><span class="count tnum">{folder.notes} notes</span><Icon name="arrow-right" size={18} /></span>
	{/if}
</a>

<style>
	.tile {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		aspect-ratio: 5 / 4;
		overflow: hidden;
		padding: var(--s-4);
		border-radius: var(--r-2xl);
		background: var(--surface);
		box-shadow: var(--shadow-card);
		isolation: isolate;
		transition: transform var(--d-base) var(--ease-out);
	}

	.tile.small {
		aspect-ratio: 16 / 11;
		border-radius: var(--r-xl);
	}

	.tile:hover {
		transform: translateY(-2px);
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

	.tile:hover img {
		transform: scale(1.03);
	}

	.counter {
		align-self: flex-start;
		padding: 2px var(--s-3);
		border-radius: var(--r-pill);
		background: var(--glass-fill);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--glass-rim);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.12em;
	}

	:global(.tile .label) {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0 var(--s-3);
		padding: var(--s-3) var(--s-4);
		border-radius: var(--r-xl);
	}

	.small :global(.label) {
		border-radius: var(--r-lg);
		padding: var(--s-2) var(--s-3);
	}

	.name {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 420;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.small .name {
		font-size: 19px;
	}

	.count {
		color: var(--ink-2);
		font-size: var(--t-small);
		white-space: nowrap;
	}

	.display-name {
		font-size: 34px;
		letter-spacing: -0.02em;
		line-height: 0.98;
	}

	.small .display-name {
		font-size: 26px;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--ink);
	}

	.foot .count {
		color: var(--ink-2);
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

	.tile:not(.cover) .counter {
		background: transparent;
		backdrop-filter: none;
		box-shadow: none;
		padding-inline: 0;
	}
</style>
