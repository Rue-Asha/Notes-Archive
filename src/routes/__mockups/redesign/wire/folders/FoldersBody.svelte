<script lang="ts">
	import Icon from '../tree/Icon.svelte';
	import SortMenu from '../tree/SortMenu.svelte';
	import type { MockTag, TreeSort } from '../../fixtures.ts';
	import { countNotes, link, plural, type WireFolder } from '../tree/data.ts';

	let { folders, tags, sort, worst, menuOpen = false }: { folders: WireFolder[]; tags: MockTag[]; sort: TreeSort; worst: boolean; menuOpen?: boolean } = $props();
</script>

<div class="page">
	<header class="head">
		<h1>Folders</h1>
		<SortMenu mode={sort} open={menuOpen} />
	</header>

	{#if folders.length}
		<ul class="panel" aria-label="Folders">
			{#each folders as folder (folder.id)}
				<li>
					<a class="row" href={link('folder', worst)}>
						<Icon name="folder" size={20} />
						<span class="name">{folder.name}</span>
						<span class="count">{plural(countNotes(folder), 'note')}</span>
						<Icon name="chevronRight" size={16} />
					</a>
				</li>
			{/each}
			<li>
				<button type="button" class="row add"><Icon name="folderPlus" size={20} /><span class="name">New folder</span></button>
			</li>
		</ul>
	{:else}
		<div class="panel empty">
			<p class="title">No folders yet</p>
			<p class="hint">Folders keep related notes together.</p>
			<button type="button" class="outline"><Icon name="folderPlus" size={18} />New folder</button>
		</div>
	{/if}

	{#if tags.length}
		<section class="tags" aria-labelledby="folders-tags">
			<div class="sec"><h2 id="folders-tags">Tags</h2><span class="n">{tags.length.toLocaleString('en')}</span></div>
			<ul>
				{#each tags as tag (tag.id)}
					<li><a href={link('tag', worst)} title="{tag.name} · {plural(tag.count, 'note')}"><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en')}</span></a></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-6);
		max-inline-size: 44rem;
		min-inline-size: 0;
	}
	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-3);
	}
	h1 {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.panel {
		border: var(--stroke-hairline) solid var(--hairline);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		overflow: hidden;
	}
	.panel li + li {
		border-block-start: var(--stroke-hairline) solid var(--hairline);
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: 3.5rem;
		padding: var(--space-2) var(--space-4);
		border: 0;
		background: none;
		color: var(--ink);
		text-align: start;
		text-decoration: none;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.row :global(svg) {
		color: var(--ink-secondary);
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
	.count {
		flex: none;
		color: var(--ink-muted);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}
	.add {
		font-size: var(--type-label-size);
		font-weight: var(--weight-medium);
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-6);
	}
	.title {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	.hint {
		color: var(--ink-secondary);
		margin-block-end: var(--space-3);
	}
	.outline {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--control-height);
		padding: 0 var(--space-5);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-pill);
		background: none;
		font-weight: var(--weight-medium);
	}
	.sec {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin-block-end: var(--space-3);
	}
	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.n {
		color: var(--ink-muted);
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
	.tags a {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: var(--control-height-s);
		padding: 0 var(--space-3-5);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
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
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	@media (hover: hover) {
		.row:hover,
		.tags a:hover {
			background: var(--surface-tint);
		}
	}
</style>
