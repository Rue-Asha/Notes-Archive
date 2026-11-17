<script module lang="ts">
	import type { MockCard } from '../../fixtures.ts';

	export interface FolderView {
		name: string;
		path: string[];
		cover: boolean;
		folders: { id: number; name: string; noteCount: number; renaming?: boolean }[];
		notes: MockCard[];
		totals?: { folders: number; notes: number };
		toast?: { message: string; kind?: 'info' | 'error' };
	}
</script>

<script lang="ts">
	import Icon from '../tree/Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import RenameField from '../tree/RenameField.svelte';
	import Toast from '../ui/Toast.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { link, plural, shortDate } from '../tree/data.ts';

	const uid = $props.id();
	let { folder, worst, posture, opened = false }: { folder: FolderView; worst: boolean; posture?: 'phone' | 'wide'; opened?: boolean } = $props();

	const parent = $derived(folder.path.at(-1) ?? 'Folders');
	const empty = $derived(!folder.folders.length && !folder.notes.length);
	// svelte-ignore state_referenced_locally
	let more = $state(opened);
	// wide: from 10 levels the first and last two ancestors stay; compact (phone, tablet): from 2 levels only "…" stands for them, the back button names the parent
	const narrow = new MediaQuery('max-width: 1099px');
	const compact = $derived(posture ? posture === 'phone' : narrow.current);
	const shortened = $derived(!more && (compact ? folder.path.length >= 2 : folder.path.length >= 10));
	const shown = $derived(shortened ? (compact ? [] : [folder.path[0], ...folder.path.slice(-2)]) : folder.path);
	// one rule everywhere: every descendant folder, every note in the folder and below
	const totals = $derived(folder.totals ?? { folders: folder.folders.length, notes: folder.notes.length + folder.folders.reduce((n, f) => n + f.noteCount, 0) });
	const counts = $derived([plural(totals.folders, 'folder'), plural(totals.notes, 'note')].join(' · '));
	const cut = $derived(folder.name.trimEnd().lastIndexOf(' '));
	const lead = $derived(cut > 0 ? folder.name.slice(0, cut + 1) : '');
	const tail = $derived(cut > 0 ? folder.name.slice(cut + 1) : folder.name);
</script>

<article class="page" data-posture={posture}>
	<nav class="back" aria-label="Back">
		<Button variant="glass" size="s" href={link(folder.path.length ? 'folder' : 'folders', worst)} title={parent}><Icon name="chevronLeft" size={18} /><span>{parent}</span></Button>
	</nav>

	<header class="screen-head" class:covered={folder.cover}>
		{#if folder.cover}
			<figure class="cover" aria-hidden="true"><img src="/__mockups/photo/lake-moraine.jpg" alt="" /></figure>
		{/if}
		<div class="screen-lead">
			<nav class="crumbs" aria-label="Path">
				<ol class="kicker">
					<li><a href={link('folders', worst)}>Folders</a></li>
					{#if shortened}
						{#if shown.length}<li class="far"><a href={link('folder', worst)} title={shown[0]}>{shown[0]}</a></li>{/if}
						<li><button type="button" class="kicker-more hit" aria-label="Show all {folder.path.length} parent folders" aria-expanded="false" onclick={() => (more = true)}>…</button></li>
						{#each shown.slice(1) as name, i (i)}
							<li class:far={i === 0 && shown.length > 2}><a href={link('folder', worst)} title={name}>{name}</a></li>
						{/each}
					{:else}
						{#each folder.path as name, i (i)}
							<li><a href={link('folder', worst)} title={name}>{name}</a></li>
						{/each}
						{#if more}<li><button type="button" class="kicker-more fold" aria-expanded="true" onclick={() => (more = false)}>Shorten path</button></li>{/if}
					{/if}
					<li aria-current="page" lang="de">{folder.name}</li>
				</ol>
			</nav>
			<h1 data-long={folder.name.length > 28 || undefined} lang="de" dir="auto">{lead}<em class="accent-word">{tail}</em></h1>
			<p class="lede">{counts}</p>
			<div class="actions">
				<Button variant="glass" size="s" aria-haspopup="menu"><Icon name="image" size={16} /><span>{folder.cover ? 'Change cover' : 'Add cover'}</span></Button>
				<span class="primary-slot"><Button variant="primary" arrow>New note</Button></span>
				<Button variant="glass" size="s"><Icon name="folderPlus" size={16} /><span>New folder</span></Button>
				<Button variant="glass" size="xs" icon aria-label="Folder menu" aria-haspopup="menu"><Icon name="more" size={20} /></Button>
			</div>
		</div>
	</header>

	<div class="screen-body">
		{#if folder.toast}
			<div class="toast-slot" role={folder.toast.kind === 'error' ? 'alert' : 'status'}><Toast message={folder.toast.message} kind={folder.toast.kind} /></div>
		{/if}

		{#if empty}
			<div class="card empty">
				<h2>Nothing here yet</h2>
				<p>Start a note in this folder, or add a folder inside it.</p>
				<div class="row">
					<Button><Icon name="plus" size={18} />New note</Button>
					<Button><Icon name="folderPlus" size={18} />New folder</Button>
				</div>
			</div>
		{/if}

		{#if folder.folders.length}
			<section aria-labelledby="{uid}-folders">
				<h2 class="ruled" id="{uid}-folders">Folders</h2>
				<ul class="hf-list">
					{#each folder.folders as sub (sub.id)}
						<li>
							{#if sub.renaming}
								<div class="hf-row renaming">
									<Icon name="folder" size={20} />
									<RenameField value={sub.name} focused />
								</div>
							{:else}
								<a class="hf-row" href={link('folder', worst)}>
									<Icon name="folder" size={20} />
									<span class="label" lang="de">{sub.name}</span>
									<span class="meta">{plural(sub.noteCount, 'note')}</span>
									<Icon name="chevronRight" size={16} />
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if folder.notes.length}
			<section aria-labelledby="{uid}-notes">
				<h2 class="ruled" id="{uid}-notes">Notes</h2>
				<ul class="hf-list">
					{#each folder.notes as note (note.id)}
						<li>
							<a class="hf-row note" href={link('note', worst)}>
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
	</div>
</article>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
		container-type: inline-size;
	}
	/* the wide breadcrumb in a narrow column keeps only the parent beside "…" */
	@container (max-width: 34rem) {
		.crumbs .far {
			display: none;
		}
	}
	.page > .screen-body {
		max-inline-size: 48rem;
	}
	.screen-head .screen-lead {
		grid-template-columns: minmax(0, 1fr);
		max-inline-size: 48rem;
	}
	/* above the cover, which bleeds up behind it */
	.back {
		position: relative;
		z-index: var(--z-raised);
		display: grid;
		justify-items: start;
		min-inline-size: 0;
	}
	.back :global(.btn) {
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target-touch));
	}
	.crumbs {
		min-inline-size: 0;
	}
	.crumbs :global(.kicker a) {
		max-inline-size: 20ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.crumbs :global(.kicker li) {
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.crumbs :global(.kicker li[aria-current]) {
		overflow-wrap: anywhere;
	}
	/* touch keeps a 44px target: links grow their box; the "…" chip keeps its small pill and grows through .hit */
	@media (max-width: 1099px), (pointer: coarse) {
		.crumbs :global(.kicker a),
		.crumbs :global(.kicker .fold) {
			display: inline-block;
			padding-block: calc((var(--target-touch) - 1lh) / 2);
			margin-block: calc((1lh - var(--target-touch)) / 2);
		}
	}
	.crumbs :global(.fold) {
		background: none;
		font-weight: var(--weight-medium);
		letter-spacing: 0;
		text-decoration: underline;
	}
	@media (min-width: 1100px) {
		.page:not([data-posture]) .back {
			display: none;
		}
	}
	.page[data-posture='wide'] .back {
		display: none;
	}
	.screen-lead h1 {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.screen-lead h1[data-long] {
		max-inline-size: 16em;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		margin-block-start: var(--space-1);
	}
	/* phone: the two labelled buttons share the row and give way (ellipsis) before the menu button wraps alone */
	@media (max-width: 479px) {
		.actions {
			flex-wrap: nowrap;
		}
		.actions :global(.btn.s) {
			flex: 0 1 auto;
			min-inline-size: 0;
			padding-inline: var(--space-3);
		}
		.actions :global(.btn.xs) {
			flex: none;
		}
	}
	.primary-slot {
		display: contents;
	}
	@media (max-width: 1099px) {
		.page:not([data-posture='wide']) .primary-slot {
			display: none;
		}
	}
	/* the cover is the head's photo: it runs behind the title to the frame edge and fades out below it, with the scrim under the type */
	.screen-head.covered {
		position: relative;
		isolation: isolate;
	}
	.cover {
		position: absolute;
		z-index: -1;
		inset-block: calc(-1 * var(--bleed-t, var(--space-3-5))) calc(-1 * var(--space-4));
		inset-inline: calc(-1 * var(--bleed-x, var(--space-3-5))) calc(-1 * var(--bleed-x, var(--space-3-5)) - var(--space-2));
		margin: 0;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(var(--ink) calc(100% - var(--stage-fade)), transparent);
		mask-image: linear-gradient(var(--ink) calc(100% - var(--stage-fade)), transparent);
	}
	.cover img {
		inline-size: 100%;
		block-size: 100%;
		max-inline-size: none;
		object-fit: cover;
	}
	/* the scrim holds at text strength under the kicker, title and counts; it softens only behind the glass buttons */
	.cover::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, var(--scrim-text) 0, var(--scrim-text) calc(100% - var(--stage-fade)), var(--scrim-soft) 100%);
	}
	.page[data-posture='phone'] .cover {
		inset-block-start: calc(-1 * var(--bleed-t, var(--space-3-5)) - var(--space-14));
	}
	@media (max-width: 1099px) {
		.page:not([data-posture]) .cover {
			inset-block-start: calc(-1 * var(--bleed-t, var(--space-3-5)) - var(--space-14));
		}
	}
	@media (min-width: 1100px) {
		.page:not([data-posture]) .cover {
			inset-inline-start: 0;
		}
		.page:not([data-posture]) .cover::after {
			background: linear-gradient(90deg, var(--scrim-text) 0, var(--scrim-text) 56%, var(--scrim-clear));
		}
	}
	section {
		display: grid;
		gap: var(--space-3);
	}
	.toast-slot {
		justify-self: start;
		max-inline-size: 100%;
	}
	.renaming {
		padding-block: var(--space-1);
	}
	.screen-body {
		gap: var(--space-8);
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
	}
	.empty .row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-block-start: var(--space-3);
	}
	.emoji {
		flex: none;
		inline-size: 20px;
		text-align: center;
		font-size: 17px;
		line-height: 20px;
	}
	.hf-row.note {
		align-items: flex-start;
	}
	.hf-row.note > :global(svg),
	.hf-row.note > .emoji {
		margin-block-start: var(--space-0-5);
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
		hyphens: auto;
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
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}
	.note .meta {
		font-size: var(--type-caption-size);
	}
</style>
