<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockFolderTile from './MockFolderTile.svelte';
	import MockNoteCard from './MockNoteCard.svelte';
	import { folders, notes, pinned, recent } from './fixtures.ts';

	const today = notes.slice(0, 3);
	const times = ['14:20', '11:05', '09:40'];
</script>

<div class="home" data-screen="home-content">
	<section class="hero">
		<div class="intro">
			<Eyebrow>Notes — Folders — Tags</Eyebrow>
			<h1 class="display">Every note,<br /><em>in its place</em></h1>
			<p class="lede tnum">148 notes in 6 folders, all of them one search away.</p>
			<div class="actions">
				<GlassPanel as="div" class="search" data-search-bar>
					<Icon name="search" size={20} />
					<span class="placeholder">Search notes</span>
					<kbd>⌘K</kbd>
				</GlassPanel>
				<Button href="#new">New note</Button>
			</div>
		</div>

		<aside class="date-tile" aria-label="Edited today">
			<div class="date-top">
				<span class="day tnum">2</span>
				<span class="month"><span class="eyebrow">Nov</span><span class="year tnum">2026</span></span>
				<span class="go" aria-hidden="true"><Icon name="arrow-right" size={18} /></span>
			</div>
			<p class="today-title">Edited today</p>
			<ul>
				{#each today as note, i (note.id)}
					<li><span class="emoji" aria-hidden="true">{note.icon}</span><span class="t">{note.title}</span><span class="time tnum">{times[i]}</span></li>
				{/each}
			</ul>
		</aside>
	</section>

	<section class="block" data-pinned>
		<header><h2>Pinned</h2><span class="counter eyebrow tnum">{String(pinned.length).padStart(2, '0')}</span></header>
		<div class="grid">
			{#each pinned as note (note.id)}<MockNoteCard {note} />{/each}
		</div>
	</section>

	<section class="block" data-recent>
		<header><h2>Recently edited</h2><a class="more" href="#all">All notes <Icon name="arrow-right" size={16} /></a></header>
		<div class="grid">
			{#each recent as note (note.id)}<MockNoteCard {note} />{/each}
		</div>
	</section>

	<section class="block" data-folders>
		<header><h2>Folders</h2><a class="more" href="#folders">All folders <Icon name="arrow-right" size={16} /></a></header>
		<div class="grid tiles">
			{#each folders as folder, i (folder.id)}<MockFolderTile {folder} index={i} total={folders.length} />{/each}
		</div>
	</section>
</div>

<style>
	.home {
		display: grid;
		gap: var(--s-9);
	}

	.hero {
		display: grid;
		gap: var(--s-7);
		padding-block-start: var(--s-4);
	}

	@media (min-width: 1100px) {
		.hero {
			grid-template-columns: minmax(0, 1fr) 300px;
			align-items: end;
			gap: var(--s-8);
			padding-block-start: var(--s-7);
		}
	}

	.intro {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
	}

	.lede {
		max-inline-size: 38ch;
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
		inline-size: 100%;
		margin-block-start: var(--s-2);
	}

	:global(.home .search) {
		display: flex;
		flex: 1 1 280px;
		align-items: center;
		gap: var(--s-3);
		max-inline-size: 460px;
		min-block-size: 52px;
		padding-inline: var(--s-5) var(--s-4);
		border-radius: var(--r-pill);
	}

	.placeholder {
		flex: 1;
		color: var(--ink-2);
	}

	kbd {
		padding: 2px var(--s-2);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--chip-bg);
		font: inherit;
		font-size: 12px;
		color: var(--ink-2);
	}

	.date-tile {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-4);
		padding: var(--s-5);
		border-radius: var(--r-2xl);
		background: var(--tile-bg);
		backdrop-filter: var(--tile-filter);
		color: var(--tile-ink);
		box-shadow: var(--shadow-float);
	}

	.date-top {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.day {
		font-family: var(--font-display);
		font-size: 56px;
		font-weight: 300;
		letter-spacing: -0.03em;
		line-height: 0.9;
	}

	@media (min-width: 768px) {
		.day {
			font-size: 64px;
		}
	}

	.month {
		display: grid;
	}

	.month .eyebrow {
		color: inherit;
	}

	.year {
		color: var(--tile-ink-2);
		font-size: var(--t-small);
	}

	.go {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		margin-inline-start: auto;
		border: 1px solid var(--tile-ring);
		border-radius: var(--r-pill);
	}

	.today-title {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		font-size: var(--t-small);
		font-weight: 500;
	}

	.today-title::before {
		content: '';
		inline-size: 6px;
		block-size: 6px;
		border-radius: var(--r-pill);
		background: var(--accent-soft);
	}

	.date-tile ul {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.date-tile li {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		padding-block: var(--s-2);
		border-block-start: 1px solid var(--tile-rule);
		font-size: var(--t-small);
	}

	.t {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.time {
		color: var(--tile-ink-2);
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

	.counter {
		font-size: 12px;
		letter-spacing: 0.12em;
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
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
