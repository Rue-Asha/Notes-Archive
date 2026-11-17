<script lang="ts">
	import Icon from '../tree/Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import SortMenu from '../tree/SortMenu.svelte';
	import type { MockTag, TreeSort } from '../../fixtures.ts';
	import { countNotes, link, plural, type WireFolder } from '../tree/data.ts';

	let { folders, tags, sort, worst, menuOpen = false }: { folders: WireFolder[]; tags: MockTag[]; sort: TreeSort; worst: boolean; menuOpen?: boolean } = $props();

	const uid = $props.id();
	const total = $derived(folders.reduce((n, f) => n + countNotes(f), 0));
</script>

<div class="page">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Notes Archive</li></ul>
			<h1>All <em class="accent-word">folders</em></h1>
			<p class="lede">{plural(folders.length, 'folder')} · {plural(total, 'note')}</p>
			<div class="actions">
				<Button variant="glass"><Icon name="folderPlus" size={18} />New folder</Button>
				<SortMenu mode={sort} open={menuOpen} align="start" glass />
			</div>
		</div>
	</header>

	<div class="screen-body">
		{#if folders.length}
			<ul class="hf-list" aria-label="Folders">
				{#each folders as folder (folder.id)}
					<li>
						<a class="hf-row" href={link('folder', worst)}>
							<Icon name="folder" size={20} />
							<span class="name" lang="de">{folder.name}</span>
							<span class="count">{plural(countNotes(folder), 'note')}</span>
							<Icon name="chevronRight" size={16} />
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="card empty">
				<h2>No folders yet</h2>
				<p>Folders keep related notes together.</p>
				<Button><Icon name="folderPlus" size={18} />New folder</Button>
			</div>
		{/if}

		{#if tags.length}
			<section class="tags" aria-labelledby="{uid}-tags">
				<div class="head"><h2 class="ruled" id="{uid}-tags">Tags</h2><span class="n">{tags.length.toLocaleString('en')}</span></div>
				<ul>
					{#each tags as tag (tag.id)}
						<li>
							<a class="chip" href={link('tag', worst)} title="{tag.name} · {plural(tag.count, 'note')}"><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en')}</span></a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>

<style>
	.page {
		min-inline-size: 0;
	}
	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-1);
	}
	.screen-body {
		gap: var(--space-8);
		max-inline-size: 44rem;
	}
	.name {
		flex: 1;
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.name {
		flex: 1;
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.count {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-7);
		background: var(--surface-raised);
		box-shadow: var(--shadow-lift);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
	}
	.empty h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.empty p {
		color: var(--ink-secondary);
		margin-block-end: var(--space-3);
	}
	.head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-block-end: var(--space-3);
	}
	.n {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.tags ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.tags li {
		max-inline-size: 100%;
	}
	.chip {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		color: var(--ink);
		text-decoration: none;
	}
	.t {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.c {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	@media (hover: hover) {
		.chip:hover {
			background: var(--surface-raised);
		}
	}
</style>
