<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { beforeNavigate, goto, invalidate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import Editor from '#lib/editor/Editor.svelte';
	import { patchNote } from '#lib/notes/api.ts';
	import { createAutosave, type Saved } from '#lib/notes/autosave.ts';
	import { beaconDiscard, discardNote, isBlankDoc, isEmptyNote } from '#lib/notes/discard.ts';
	import NoteHeader from '#lib/notes/NoteHeader.svelte';
	import NoteIcon from '#lib/notes/NoteIcon.svelte';
	import NoteMenu from '#lib/notes/NoteMenu.svelte';
	import NoteProperties from '#lib/notes/NoteProperties.svelte';
	import SaveStatus from '#lib/notes/SaveStatus.svelte';
	import { toast } from '#lib/shell/toast.ts';
	import { titleLine } from '#lib/title.ts';
	import type { Crumb, Id, JSONContent, Note, NotePatch, TreeFolder } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: { data: PageProps['data'] } = $props();

	// data changes with every layout invalidation, data.note only when the page load runs again: deriving through
	// `loaded` keeps local edits to `note` until then
	const loaded = $derived(data.note);
	let note: Note = $derived(loaded);
	let doc: JSONContent = $derived(loaded.content);
	let gone = false;
	let body = $state<Editor>();

	// only a note that opened empty is new; one the user empties by hand is theirs and stays
	const autofocus = $derived(loaded.title.trim() === '' && isBlankDoc(loaded.content));
	const crumbs = $derived(folderPath(data.tree.folders, note.folderId));

	// a deep path keeps the note's own folders beside "…": two on wide screens, one on the phone
	const phone = new MediaQuery('max-width: 767px');
	const keep = $derived(phone.current ? 1 : 2);
	let allCrumbs = $state(false);
	const held = $derived(crumbs.length > keep + 1 && !allCrumbs ? crumbs.slice(0, -keep) : []);
	const shown = $derived(held.length ? crumbs.slice(-keep) : crumbs);

	function folderPath(folders: TreeFolder[], id: Id | null): Crumb[] {
		if (id === null) return [];
		for (const f of folders) {
			if (f.id === id) return [{ id: f.id, name: f.name }];
			const below = folderPath(f.children, id);
			if (below.length) return [{ id: f.id, name: f.name }, ...below];
		}
		return [];
	}

	const saver = $derived(
		createAutosave({
			send: (patch, keepalive) =>
				keepalive
					? fetch(`/api/notes/${loaded.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch), keepalive })
					: patchNote(loaded.id, patch),
			onsaved: saved,
			onfailed: () => toast(COPY.saveFailed, 'error')
		})
	);
	const saveState = $derived(saver.state);

	function change(patch: NotePatch) {
		const { tags, content, ...fields } = patch;
		if (content) doc = content;
		note = { ...note, ...fields, ...(tags ? { tags: tags.map((name) => note.tags.find((t) => t.name === name) ?? { id: 0, name }) } : {}) };
		saver.change(patch);
	}

	function saved(patch: NotePatch, { updatedAt, tags }: Saved) {
		// the server folds and dedupes tags; take its list unless newer chips are already on the page
		const sameTags = patch.tags !== undefined && patch.tags.join('\n') === note.tags.map((t) => t.name).join('\n');
		note = { ...note, updatedAt, ...(sameTags ? { tags } : {}) };
		if (['title', 'icon', 'folderId', 'tags', 'pinned'].some((key) => key in patch)) void invalidate('app:tree');
	}

	function deleted(folderId: Id | null) {
		gone = true;
		saver.stop();
		void goto(folderId === null ? '/' : `/folders/${folderId}`);
	}

	const empty = () => autofocus && !gone && $saveState !== 'deleted' && isEmptyNote(note, doc);

	// the navigation waits for the pending save (and the discard of a note left empty); after a failed save the page
	// stays, so nothing typed is lost
	let leaving = false;
	beforeNavigate((navigation) => {
		if (leaving || !navigation.to || navigation.willUnload || !(saver.busy || empty())) return;
		const to = navigation.to.url;
		navigation.cancel();
		leaving = true;
		saver
			.flush()
			.then(async () => {
				if (saver.busy) return;
				if (empty()) {
					saver.stop();
					await discardNote(note.id);
				}
				await goto(to);
			})
			.finally(() => (leaving = false));
	});

	function pagehide() {
		if (empty()) beaconDiscard(note.id);
		else void saver.flush(true);
	}
</script>

<svelte:window onpagehide={pagehide} />

<svelte:head><title>{titleLine(note.title)} · Notes Archive</title></svelte:head>

<article class="note-wrap" data-note-page>
	<div class="bar">
		<nav class="path" aria-label="Note path">
			<ol class="kicker">
				<li><a href="/">Home</a></li>
				{#if held.length}
					<li>
						<button type="button" class="kicker-more hit" aria-label={COPY.pathMore(held.length)} title={held.map((c) => c.name).join(' / ')} data-press onclick={() => (allCrumbs = true)}>…</button>
					</li>
				{/if}
				{#each shown as crumb, i (crumb.id)}
					<li>
						{#if i < shown.length - 1 || $saveState === 'deleted'}<a href="/folders/{crumb.id}" title={crumb.name}>{crumb.name}</a>{:else}<span aria-current="page" title={crumb.name}>{crumb.name}</span>{/if}
					</li>
				{/each}
			</ol>
		</nav>
		<div class="detail-actions">
			<SaveStatus state={$saveState} onretry={() => saver.flush()} />
			<NoteMenu {note} onchange={change} ondeleted={deleted} />
		</div>
	</div>

	<NoteHeader
		title={note.title}
		{autofocus}
		inert={$saveState === 'deleted'}
		ontitle={(title) => change({ title })}
		onblur={() => saver.flush()}
		onenter={() => body?.focusStart()}
	>
		<NoteProperties {note} path={crumbs.map((c) => c.name)} tree={data.tree} tags={data.tags} onchange={change}>
			{#snippet icon()}
				<NoteIcon icon={note.icon} onchange={(icon) => change({ icon })} />
			{/snippet}
		</NoteProperties>
	</NoteHeader>

	<div class="card editor" data-note-column>
		{#if $saveState === 'deleted'}
			<p class="notice" role="alert">{COPY.noteDeleted}</p>
		{/if}
		<div class="content" inert={$saveState === 'deleted'}>
			{#key loaded.id}
				<Editor bind:this={body} noteId={loaded.id} content={loaded.content} onchange={(content) => change({ content })} onblur={() => saver.flush()} />
			{/key}
		</div>
	</div>
</article>

<style>
	/* the column is the note's measure plus the card's padding, centred in whatever area the shell gives the page.
	   From 1100 px the measure widens to 102ch (1.5 ×) and the card's padding eases to --space-8: the writing area
	   fills the frame's content column and, with the sidebar folded to its rail, grows to that generous cap instead
	   of stopping at a third of the screen. Tables, images and code use the whole column. */
	.note-wrap {
		--card-pad-x: var(--space-9);
		--note-measure: var(--measure);
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		inline-size: 100%;
		max-inline-size: calc(var(--note-measure) + 2 * var(--card-pad-x));
		min-inline-size: 0;
		margin-inline: auto;
		padding-block-end: var(--space-10);
	}

	@media (min-width: 1100px) {
		.note-wrap {
			--note-measure: calc(var(--measure) * 1.5);
			--card-pad-x: var(--space-8);
		}
	}

	@media (max-width: 1099px) {
		.note-wrap {
			--card-pad-x: var(--space-7);
		}
	}

	@media (max-width: 767px) {
		.note-wrap {
			--card-pad-x: var(--space-4);
		}
	}

	.bar {
		position: relative;
		z-index: var(--z-menu);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2) var(--space-4);
		min-inline-size: 0;
		padding-block-start: var(--space-1);
	}

	.path {
		flex: 1 1 14rem;
		min-inline-size: 0;
	}

	.path a,
	.path span {
		overflow-wrap: anywhere;
	}

	/* touch keeps a 44 px target: the links grow their box, not their line */
	@media (max-width: 1099px), (pointer: coarse) {
		.path a {
			display: inline-block;
			padding-block: calc((var(--target-touch) - 1lh) / 2);
			margin-block: calc((1lh - var(--target-touch)) / 2);
		}
	}

	.editor {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		align-content: start;
		padding: var(--space-8) var(--card-pad-x) var(--space-10);
		background: var(--surface-raised);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
		box-shadow: var(--shadow-lift);
	}

	@media (max-width: 767px) {
		.editor {
			gap: var(--space-4);
			padding-block: var(--space-5) var(--space-6);
			border-radius: var(--radius-card-s);
		}
	}

	.notice {
		display: flex;
		align-items: center;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--danger-soft);
		box-shadow: var(--ring-danger);
		color: var(--danger);
		font-weight: var(--weight-semibold);
	}

	.content {
		min-inline-size: 0;
	}

	.content[inert] {
		opacity: var(--disabled-opacity);
	}
</style>
