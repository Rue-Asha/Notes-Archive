<script lang="ts">
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
	import Icon from '#lib/ui/Icon.svelte';
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

<article class="page" data-note-page>
	<div class="topbar">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="/">Home</a>
			{#each crumbs as crumb (crumb.id)}
				<Icon name="chevron" size={14} /><a href="/folders/{crumb.id}">{crumb.name}</a>
			{/each}
		</nav>
		<div class="tools">
			<SaveStatus state={$saveState} onretry={() => saver.flush()} />
			<NoteMenu {note} onchange={change} ondeleted={deleted} />
		</div>
	</div>

	<div class="column" data-note-column>
		{#if $saveState === 'deleted'}
			<p class="notice" role="alert">{COPY.noteDeleted}</p>
		{/if}
		<NoteHeader
			noteId={note.id}
			title={note.title}
			createdAt={note.createdAt}
			updatedAt={note.updatedAt}
			{autofocus}
			ontitle={(title) => change({ title })}
			onblur={() => saver.flush()}
			onenter={() => body?.focusStart()}
		>
			{#snippet icon()}
				<NoteIcon icon={note.icon} onchange={(icon) => change({ icon })} />
			{/snippet}
			<NoteProperties {note} tree={data.tree} tags={data.tags} onchange={change} />
		</NoteHeader>

		{#key loaded.id}
			<Editor bind:this={body} noteId={loaded.id} content={loaded.content} onchange={(content) => change({ content })} onblur={() => saver.flush()} />
		{/key}
	</div>
</article>

<style>
	.page {
		display: grid;
		/* a wide table or code line scrolls in its own block instead of stretching the page */
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-6);
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		min-block-size: var(--control);
	}

	.crumbs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		min-inline-size: 0;
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.crumbs a {
		color: inherit;
		text-decoration: none;
	}

	.crumbs a:hover {
		color: var(--ink);
	}

	.crumbs a:last-child {
		color: var(--ink);
		font-weight: 600;
	}

	.tools {
		display: flex;
		align-items: center;
		gap: var(--s-2);
	}

	.notice {
		margin-block-end: var(--s-6);
		padding: var(--s-3) var(--s-5);
		border-radius: var(--r-lg);
		background: var(--danger-soft);
		color: var(--danger);
		font-size: var(--t-body);
		font-weight: 500;
	}

	/* the reading column, centred in whatever area the shell gives the page */
	.column {
		inline-size: 100%;
		max-inline-size: var(--note-col);
		margin-inline: auto;
		padding-block-end: var(--s-11);
	}
</style>
