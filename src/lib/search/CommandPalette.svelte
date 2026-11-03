<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import { relativeTime } from '#lib/notes/time.ts';
	import type { NoteCard, SearchHit } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { portal, trapTab } from '#lib/ui/overlay.ts';
	import Sheet from '#lib/ui/Sheet.svelte';
	import Highlight from './Highlight.svelte';
	import { closePalette, openPalette, palette } from './palette.svelte.ts';

	const phone = new MediaQuery('max-width: 767px');

	const DEBOUNCE = 120;

	let recent = $state<NoteCard[]>([]);
	let hits = $state<SearchHit[]>([]);
	let q = $state('');
	// the term `hits` answers, so "No notes match" never shows for a query still in flight; old hits stay until then
	let answered = $state('');
	let leaving = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let controller: AbortController | undefined;
	let input = $state<HTMLInputElement>();
	let active = $state(0);
	let opener: HTMLElement | null = null;

	// the editor's last selection, kept while the palette has the focus, so closing it puts the same selection back
	let editorRange: Range | null = null;

	// a range across two paragraphs has the .ProseMirror element itself as its common ancestor
	const editorOf = (range: Range) =>
		(range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement)?.closest<HTMLElement>('.ProseMirror');

	function remember() {
		const selection = getSelection();
		if (palette.open || !selection?.rangeCount) return;
		const range = selection.getRangeAt(0);
		if (editorOf(range)) editorRange = range.cloneRange();
	}

	function forget(event: FocusEvent) {
		if (palette.open) return;
		const target = event.target as HTMLElement;
		if (target.matches('input, textarea')) editorRange = null;
	}

	function restore() {
		const root = editorRange && editorOf(editorRange);
		if (editorRange && root?.isConnected) {
			root.focus({ preventScroll: true });
			const selection = getSelection();
			selection?.removeAllRanges();
			selection?.addRange(editorRange);
		} else if (opener?.isConnected) opener.focus();
	}

	function shortcut(event: KeyboardEvent) {
		if (event.defaultPrevented || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
		event.preventDefault();
		openPalette();
	}

	const term = $derived(q.trim());
	const notes = $derived<NoteCard[]>(term ? hits.map((h) => h.note) : recent);
	const actions = [
		{ label: COPY.newNote, icon: 'plus' as const, run: () => newNote() },
		{
			label: COPY.newFolder,
			icon: 'folder' as const,
			run: async () => {
				const id = await newFolder();
				await invalidate('app:tree');
				await goto(`/folders/${id}`);
			}
		}
	];
	const seeAll = $derived(term ? `/search?q=${encodeURIComponent(term)}` : null);
	// the keyboard walks notes, then actions, then "See all results"
	const total = $derived(notes.length + actions.length + (seeAll ? 1 : 0));

	async function load(value: string) {
		controller?.abort();
		const { signal } = (controller = new AbortController());
		const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=8`, { signal }).catch(() => null);
		if (!res || signal.aborted) return;
		const data = (await res.json()) as { hits: SearchHit[]; recent: NoteCard[] };
		if (!value) recent = data.recent;
		else {
			hits = data.hits;
			active = 0;
		}
		answered = value;
	}

	function typed() {
		active = 0;
		clearTimeout(timer);
		controller?.abort();
		if (!term) {
			hits = [];
			answered = '';
		}
		else timer = setTimeout(() => load(term), DEBOUNCE);
	}

	function choose(index: number) {
		leaving = true;
		if (index < notes.length) goto(`/notes/${notes[index].id}`);
		else if (index < notes.length + actions.length) actions[index - notes.length].run();
		else goto(seeAll!);
	}

	afterNavigate(() => {
		if (palette.open) closePalette();
	});

	let was = false;
	$effect(() => {
		const now = palette.open;
		if (now && !was) {
			opener = document.activeElement as HTMLElement | null;
			q = '';
			hits = [];
			answered = '';
			active = 0;
			leaving = false;
			load('');
			tick().then(() => input?.focus());
		} else if (!now && was) {
			clearTimeout(timer);
			controller?.abort();
			if (!leaving) setTimeout(restore, 0);
		}
		was = now;
	});

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closePalette();
		} else trapTab(event, event.currentTarget as HTMLElement);
	}

	function navigate(event: KeyboardEvent) {
		const moves: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1 };
		if (event.key in moves) {
			event.preventDefault();
			active = (moves[event.key] + total) % total;
		} else if (event.key === 'Enter' && !event.isComposing) {
			event.preventDefault();
			choose(active);
		}
	}

	$effect(() => {
		active;
		document.querySelector('#palette-list [aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
	});
</script>

<svelte:window onkeydown={shortcut} />
<svelte:document onselectionchange={remember} onfocusin={forget} />

{#snippet body()}
	<div class="input">
		<Icon name="search" size={20} />
		<input bind:this={input} type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-label="Search notes" placeholder="Search notes" bind:value={q} oninput={typed} onkeydown={navigate} autocomplete="off" spellcheck="false" />
		<kbd>Esc</kbd>
	</div>
	<div class="results" id="palette-list" role="listbox" aria-label="Results">
		<div class="list">
			{#if term}
				{#if hits.length}
					<div role="group" aria-label="Notes">
						<p class="eyebrow tnum">Notes · {hits.length} {hits.length === 1 ? 'result' : 'results'}</p>
						{#each hits as hit, i (hit.note.id)}
							<a class="row" role="option" aria-selected={i === active} href="/notes/{hit.note.id}" onclick={() => (leaving = true)} onpointermove={() => (active = i)}>
								<span class="emoji" aria-hidden="true">{hit.note.icon ?? ''}</span>
								<span class="text">
									<span class="title">{hit.note.title.trim() || COPY.untitled}</span>
									<span class="snippet"><Highlight parts={hit.parts} /></span>
								</span>
							</a>
						{/each}
					</div>
				{:else if answered === term}
					<p class="empty">{COPY.noMatch(term)}</p>
				{/if}
			{:else}
				<div role="group" aria-labelledby="palette-recent">
					<p class="eyebrow" id="palette-recent">Recent</p>
					{#each recent as note, i (note.id)}
						<a class="row" role="option" aria-selected={i === active} href="/notes/{note.id}" onclick={() => (leaving = true)} onpointermove={() => (active = i)}>
							<span class="emoji" aria-hidden="true">{note.icon ?? ''}</span>
							<span class="title">{note.title.trim() || COPY.untitled}</span>
							<span class="path tnum">{relativeTime(note.updatedAt)}</span>
						</a>
					{/each}
				</div>
			{/if}
			<div role="group" aria-labelledby="palette-actions">
				<p class="eyebrow" id="palette-actions">Actions</p>
				{#each actions as action, i (action.label)}
					{@const at = notes.length + i}
					<button class="row" type="button" role="option" aria-selected={at === active} tabindex="-1" onpointermove={() => (active = at)} onclick={() => choose(at)}>
						<span class="emoji"><Icon name={action.icon} size={18} /></span><span class="title">{action.label}</span>
					</button>
				{/each}
			</div>
		</div>
		{#if seeAll}
			<a class="foot" role="option" aria-selected={active === total - 1} href={seeAll} onclick={() => (leaving = true)} onpointermove={() => (active = total - 1)}>
				<span>{COPY.seeAll}</span><kbd>↵</kbd>
			</a>
		{/if}
	</div>
{/snippet}

{#if phone.current}
	<Sheet open={palette.open} side="full" label="Search" onclose={closePalette}>
		{@render body()}
	</Sheet>
{:else if palette.open}
	<div class="overlay" role="presentation" use:portal transition:fadeSlide={{ y: 0 }} onpointerdown={(e) => e.target === e.currentTarget && closePalette()}>
		<div class="panel glass strong" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1" onkeydown={keys} transition:fadeSlide use:hideOnOutro>
			{@render body()}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		background: var(--veil);
		backdrop-filter: var(--veil-filter);
	}

	.panel {
		position: absolute;
		inset-inline: var(--s-4);
		inset-block-start: 12dvh;
		max-inline-size: 640px;
		max-block-size: 76dvh;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--r-2xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.input {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-5) var(--s-6);
		border-block-end: 1px solid var(--line);
		font-size: 18px;
	}

	input {
		flex: 1;
		min-inline-size: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 500;
		outline: none;
	}

	input::placeholder {
		color: var(--ink-2);
		font-weight: 400;
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

	.results {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-block-size: 0;
	}

	.list {
		display: grid;
		flex: 1;
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		gap: 2px;
		overflow-y: auto;
		padding: var(--s-3);
	}

	.eyebrow {
		padding: var(--s-3) var(--s-3) var(--s-1);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-3);
		border: 1px solid transparent;
		border-radius: var(--r-lg);
		color: inherit;
		text-decoration: none;
	}

	button.row {
		inline-size: 100%;
		background: none;
		font: inherit;
		text-align: start;
		cursor: pointer;
	}

	.row[aria-selected='true'] {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
	}

	.emoji {
		flex: none;
		inline-size: 26px;
		text-align: center;
		font-size: 22px;
		line-height: 1;
	}

	.title {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.text {
		display: grid;
		flex: 1;
		min-inline-size: 0;
		gap: 2px;
	}

	.text .title {
		flex: none;
	}

	.snippet {
		overflow: hidden;
		color: var(--ink-2);
		font-size: var(--t-small);
		line-height: 1.4;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty {
		padding: var(--s-5) var(--s-3);
		color: var(--ink-2);
		overflow-wrap: anywhere;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--s-3) var(--s-6);
		border-block-start: 1px solid var(--line);
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 600;
		text-decoration: none;
	}

	.foot[aria-selected='true'] {
		background: var(--row-active);
	}

	.path {
		color: var(--ink-2);
		font-size: 12px;
		white-space: nowrap;
	}
</style>
