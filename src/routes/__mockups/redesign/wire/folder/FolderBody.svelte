<script module lang="ts">
	import type { MockCard } from '../../fixtures.ts';

	export interface FolderView {
		name: string;
		path: string[];
		cover: boolean;
		folders: { id: number; name: string; noteCount: number }[];
		notes: MockCard[];
	}
</script>

<script lang="ts">
	import Icon from '../tree/Icon.svelte';
	import { link, plural, shortDate } from '../tree/data.ts';

	const uid = $props.id();
	let { folder, worst, posture }: { folder: FolderView; worst: boolean; posture?: 'phone' } = $props();

	const parent = $derived(folder.path.at(-1) ?? 'Folders');
	const empty = $derived(!folder.folders.length && !folder.notes.length);
	let more = $state(false);
	const HIDE_FROM = 10;
	const shortened = $derived(folder.path.length >= HIDE_FROM && !more);
	const shown = $derived(shortened ? [folder.path[0], ...folder.path.slice(-2)] : folder.path);
	const counts = $derived([folder.folders.length && plural(folder.folders.length, 'folder'), folder.notes.length && plural(folder.notes.length, 'note')].filter(Boolean).join(' · '));
</script>

<article class="page" data-posture={posture}>
	<nav class="back" aria-label="Back">
		<a href={link(folder.path.length ? 'folder' : 'folders', worst)} title={parent}><Icon name="chevronLeft" size={20} /><span>{parent}</span></a>
	</nav>
	<nav class="crumbs" aria-label="Path">
		<ol data-open={more || undefined}>
			<li><a href={link('folders', worst)}>Folders</a></li>
			{#if shortened}
				<li><a href={link('folder', worst)} title={shown[0]}>{shown[0]}</a></li>
				<li><button type="button" class="more" aria-label="Show all {folder.path.length} parent folders" aria-expanded="false" onclick={() => (more = true)}>…</button></li>
				{#each shown.slice(1) as name, i (i)}
					<li><a href={link('folder', worst)} title={name}>{name}</a></li>
				{/each}
			{:else}
				{#each folder.path as name, i (i)}
					<li><a href={link('folder', worst)} title={name}>{name}</a></li>
				{/each}
				{#if more}<li class="fold"><button type="button" class="more" aria-expanded="true" onclick={() => (more = false)}>Shorten path</button></li>{/if}
			{/if}
		</ol>
	</nav>

	{#if folder.cover}
		<div class="cover" role="img" aria-label="Cover">
			<Icon name="image" size={28} />
			<button type="button" class="outline" aria-haspopup="menu"><Icon name="image" size={16} />Change cover</button>
		</div>
	{/if}

	<header class="title">
		<div class="row">
			<h1>{folder.name}</h1>
			<button type="button" class="menu" aria-label="Folder menu" aria-haspopup="menu"><Icon name="more" size={20} /></button>
		</div>
		{#if counts}<p class="counts">{counts}</p>{/if}
		{#if !folder.cover}
			<button type="button" class="outline add-cover"><Icon name="image" size={16} />Add cover</button>
		{/if}
	</header>

	{#if empty}
		<div class="panel empty">
			<p class="nothing">Nothing here yet</p>
			<div class="actions">
				<button type="button" class="solid"><Icon name="plus" size={18} />New note</button>
				<button type="button" class="outline"><Icon name="folderPlus" size={18} />New folder</button>
			</div>
		</div>
	{:else}
		<div class="actions">
			<button type="button" class="solid"><Icon name="plus" size={18} />New note</button>
			<button type="button" class="outline"><Icon name="folderPlus" size={18} />New folder</button>
		</div>

		{#if folder.folders.length}
			<section aria-labelledby="{uid}-folders">
				<h2 id="{uid}-folders">Folders</h2>
				<ul class="panel">
					{#each folder.folders as sub (sub.id)}
						<li>
							<a class="item" href={link('folder', worst)}>
								<Icon name="folder" size={20} />
								<span class="label">{sub.name}</span>
								<span class="meta">{plural(sub.noteCount, 'note')}</span>
								<Icon name="chevronRight" size={16} />
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if folder.notes.length}
			<section aria-labelledby="{uid}-notes">
				<h2 id="{uid}-notes">Notes</h2>
				<ul class="panel">
					{#each folder.notes as note (note.id)}
						<li>
							<a class="item note" href={link('note', worst)}>
								{#if note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{:else}<Icon name="note" size={20} />{/if}
								<span class="stack">
									<span class="label">{note.title || 'Untitled'}</span>
									<span class="snippet">{note.snippet}</span>
								</span>
								<span class="meta">{shortDate(note.updated)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/if}
</article>

<style>
	.page {
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		max-inline-size: 48rem;
		min-inline-size: 0;
	}
	.back,
	.crumbs {
		min-inline-size: 0;
	}
	.crumbs {
		display: none;
	}
	.back a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		max-inline-size: 100%;
		min-block-size: var(--target-touch);
		margin-inline-start: calc(-1 * var(--space-1));
		padding-inline: var(--space-1) var(--space-3);
		border-radius: var(--radius-pill);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-body-size);
	}
	.back span {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@media (min-width: 1024px) {
		.page:not([data-posture]) .back {
			display: none;
		}
		.page:not([data-posture]) .crumbs {
			display: block;
		}
	}
	.crumbs ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
	}
	.crumbs li {
		display: flex;
		align-items: center;
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.crumbs li + li::before {
		content: '/';
		padding-inline: var(--space-1-5);
		color: var(--ink-muted);
	}
	.crumbs a,
	.crumbs .more {
		display: block;
		min-inline-size: 0;
		max-inline-size: 18ch;
		min-block-size: var(--target);
		padding: 0 var(--space-1);
		border: 0;
		border-radius: var(--radius-text);
		background: none;
		color: inherit;
		line-height: var(--target);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.crumbs .more {
		min-inline-size: var(--target);
		max-inline-size: none;
		background: var(--surface-tint);
		color: var(--ink);
		font-weight: var(--weight-bold);
		letter-spacing: 0.08em;
	}
	.crumbs .fold .more {
		background: none;
		font-weight: var(--weight-medium);
		letter-spacing: 0;
		text-decoration: underline;
	}
	.crumbs ol[data-open] {
		display: grid;
		justify-items: start;
	}
	.crumbs ol[data-open] li + li::before {
		content: none;
	}
	.crumbs ol[data-open] a {
		max-inline-size: 100%;
		white-space: normal;
		overflow-wrap: anywhere;
		line-height: var(--type-label-line);
		padding-block: var(--space-1-5);
	}
	.cover {
		position: relative;
		inline-size: 100%;
		box-sizing: border-box;
		display: grid;
		place-items: center;
		min-block-size: 9rem;
		aspect-ratio: 16 / 5;
		border-radius: var(--radius-card-s);
		background: var(--surface-tint-strong);
		color: var(--ink-secondary);
	}
	.cover .outline {
		position: absolute;
		inset-block-end: var(--space-3);
		inset-inline-end: var(--space-3);
		background: var(--surface-raised);
	}
	.title {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-items: start;
		gap: var(--space-2);
	}
	.title .row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		inline-size: 100%;
	}
	h1 {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.menu {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--control-height);
		block-size: var(--control-height);
		padding: 0;
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.counts {
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.solid,
	.outline {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: var(--control-height);
		padding: 0 var(--space-5);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		color: var(--ink);
		font-weight: var(--weight-medium);
		font-size: var(--type-label-size);
		max-inline-size: 100%;
	}
	.solid {
		border-color: var(--surface-inverse);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.add-cover {
		min-block-size: var(--control-height-s);
		padding-inline: var(--space-4);
		border-style: dashed;
		color: var(--ink-secondary);
		font-weight: var(--weight-regular);
	}
	section h2 {
		margin-block-end: var(--space-2);
		padding-inline: var(--space-1);
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
		letter-spacing: 0;
		color: var(--ink-secondary);
	}
	.panel {
		border: var(--stroke-hairline) solid var(--hairline);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		overflow: hidden;
	}
	li + li {
		border-block-start: var(--stroke-hairline) solid var(--hairline);
	}
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-block-size: 3.5rem;
		padding: var(--space-2-5) var(--space-4);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}
	.item :global(svg),
	.emoji {
		color: var(--ink-secondary);
	}
	.emoji {
		flex: none;
		inline-size: 20px;
		text-align: center;
		font-size: 17px;
		line-height: 20px;
	}
	.item.note {
		align-items: flex-start;
	}
	.item.note > :global(svg),
	.item.note > .emoji {
		margin-block-start: 3px;
	}
	.stack {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		gap: var(--space-0-5);
	}
	.label {
		flex: 1;
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.note .label {
		flex: none;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		font-weight: var(--weight-semibold);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
	}
	.snippet {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		line-height: var(--type-body-s-line);
	}
	.meta {
		flex: none;
		color: var(--ink-muted);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}
	.note .meta {
		margin-block-start: 2px;
		font-size: var(--type-caption-size);
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-4);
		padding: var(--space-8) var(--space-6);
	}
	.nothing {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
	}
	@media (hover: hover) {
		.item:hover {
			background: var(--surface-tint);
		}
	}
</style>
