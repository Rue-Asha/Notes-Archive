<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockFolderTile from '#lib/mockups/MockFolderTile.svelte';
	import MockNoteCard from '#lib/mockups/MockNoteCard.svelte';
	import MockShell from '#lib/mockups/MockShell.svelte';
	import { notes, photo, subfolders } from '#lib/mockups/fixtures.ts';

	const inside = [...notes.slice(0, 3), ...notes.slice(5, 6), ...notes.slice(3, 5), ...notes.slice(6, 8)];
</script>

<svelte:head><title>Folder · Notes Archive mockups</title></svelte:head>

<div data-screen="folder">
	<MockShell active="tree">
		<div class="page">
			<nav class="crumbs" aria-label="Breadcrumb">
				<a href="#home">Home</a><Icon name="chevron" size={14} /><span aria-current="page">Architecture</span>
			</nav>

			<header class="cover" data-cover-header>
				<img src={photo('house-solitude')} alt="" />
				<IconButton class="cover-control" icon="image" label="Change cover" />
				<GlassPanel as="div" strong class="title-panel">
					<Eyebrow>Folder</Eyebrow>
					<h1 class="display">Architecture</h1>
					<p class="counts tnum">3 folders · 28 notes</p>
				</GlassPanel>
				<GlassPanel as="div" class="actions">
					<Button href="#new">New note</Button>
					<Button variant="secondary" href="#folder">New folder</Button>
				</GlassPanel>
			</header>

			<section class="block" data-subfolders>
				<header><h2>Folders</h2><span class="eyebrow tnum">03</span></header>
				<div class="grid tiles">
					{#each subfolders as folder, i (folder.id)}<MockFolderTile {folder} index={i} total={subfolders.length} small />{/each}
				</div>
			</section>

			<section class="block">
				<header><h2>Notes</h2><span class="sort">Last edited <Icon name="chevron" size={14} /></span></header>
				<div class="grid">
					{#each inside as note (note.id)}<MockNoteCard {note} />{/each}
				</div>
			</section>
		</div>
	</MockShell>
</div>

<style>
	.page {
		display: grid;
		gap: var(--s-8);
	}

	.crumbs {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.crumbs span {
		color: var(--ink);
		font-weight: 600;
	}

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

	@media (min-width: 768px) {
		.cover {
			display: grid;
			grid-template-columns: minmax(0, auto) auto;
			align-items: end;
			justify-content: space-between;
			min-block-size: 380px;
			padding: var(--s-6);
		}
	}

	.cover img {
		position: absolute;
		inset: 0;
		z-index: -1;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: 50% 28%;
	}

	:global(.cover-control) {
		position: absolute;
		inset-block-start: var(--s-4);
		inset-inline-end: var(--s-4);
	}

	:global(.title-panel) {
		display: grid;
		gap: var(--s-2);
		padding: var(--s-5) var(--s-6);
		border-radius: var(--r-2xl);
	}

	:global(.title-panel h1) {
		font-size: var(--t-display-2);
	}

	.counts {
		color: var(--ink-2);
	}

	:global(.cover .actions) {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
		padding: var(--s-3);
		border-radius: var(--r-pill);
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
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 600;
	}

	.grid {
		display: grid;
		gap: var(--s-4);
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	.tiles {
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	}

	@media (min-width: 768px) {
		.grid {
			gap: var(--s-5);
		}

		.tiles {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		}
	}
</style>
