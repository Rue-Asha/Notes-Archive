<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { titleLine } from '#lib/title.ts';
	import { newFolder, newNote } from '#lib/notes/api.ts';
	import { relativeTime } from '#lib/notes/time.ts';
	import type { NoteCard, SearchHit } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { portal, trapTab } from '#lib/ui/overlay.ts';
	import Sheet from '#lib/ui/Sheet.svelte';
	import Highlight from './Highlight.svelte';
	import { hitDisplay } from './query.ts';
	import NoMatch from './NoMatch.svelte';
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
	type Row = { kind: 'note'; index: number } | { kind: 'action'; index: number } | { kind: 'seeAll' };
	// the term whose search failed: its stale hits are gone and the list says so
	let failed = $state('');

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
		} else if (opener?.isConnected) opener.focus({ preventScroll: true });
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
	const pad = (n: number) => String(n).padStart(Math.max(2, String(notes.length).length), '0');
	const total = $derived(notes.length + actions.length + (seeAll ? 1 : 0));

	async function load(value: string) {
		controller?.abort();
		const { signal } = (controller = new AbortController());
		const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=8`, { signal }).catch(() => null);
		if (signal.aborted) return;
		if (!res?.ok) {
			if (value) {
				failed = value;
				hits = [];
				answered = '';
				active = 0;
			}
			return;
		}
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
		failed = '';
		clearTimeout(timer);
		controller?.abort();
		if (!term) {
			hits = [];
			answered = '';
		}
		else timer = setTimeout(() => load(term), DEBOUNCE);
	}

	function intentAt(index: number): Row {
		if (index < notes.length) return { kind: 'note', index };
		if (index < notes.length + actions.length) return { kind: 'action', index: index - notes.length };
		return { kind: 'seeAll' };
	}

	function run(intent: Row) {
		leaving = true;
		if (intent.kind === 'note') goto(`/notes/${notes[intent.index].id}`);
		else if (intent.kind === 'action') actions[intent.index].run();
		else goto(seeAll!);
	}

	function choose(index: number) {
		active = index;
		run(intentAt(index));
	}

	afterNavigate(() => {
		if (palette.open) closePalette();
	});

	let was = false;
	let restoring: ReturnType<typeof setTimeout>;
	$effect(() => {
		const now = palette.open;
		if (now && !was) {
			clearTimeout(restoring);
			opener = document.activeElement as HTMLElement | null;
			q = '';
			failed = '';
			hits = [];
			answered = '';
			active = 0;
			leaving = false;
			load('');
			tick().then(() => input?.focus({ preventScroll: true }));
		} else if (!now && was) {
			clearTimeout(timer);
			controller?.abort();
			if (!leaving) restoring = setTimeout(restore, 0);
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
			// a note row means a note only once the hits answer what is typed: until then (or after a failed search)
			// Enter there does nothing; the actions and "See all results" need no answer and run at once
			if (term && answered !== term && intentAt(active).kind === 'note') return;
			choose(active);
		}
	}

	// keeps the active row in the list's view by scrolling the list alone: scrollIntoView would also scroll the page
	// behind (its scroll-padding clears the dock), even though the palette is fixed over it
	$effect(() => {
		active;
		const list = document.getElementById('palette-list');
		const row = list?.querySelector<HTMLElement>('[aria-selected="true"]');
		if (!list || !row) return;
		const box = list.getBoundingClientRect();
		const at = row.getBoundingClientRect();
		if (at.top < box.top) list.scrollTop -= box.top - at.top;
		else if (at.bottom > box.bottom) list.scrollTop += at.bottom - box.bottom;
	});
</script>

<svelte:window onkeydown={shortcut} />
<svelte:document onselectionchange={remember} onfocusin={forget} />

{#snippet arrow()}
	<span class="circle" aria-hidden="true">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
	</span>
{/snippet}

<!-- which note the arrows are on, of how many: "01 / 06" (the hi-fi's group head); off the notes it stays on the last -->
{#snippet position()}
	<span class="position"><span class="sr-only">Note </span>{pad(Math.min(active, notes.length - 1) + 1)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true">{' / '}</span>{pad(notes.length)}</span></span>
{/snippet}

{#snippet body(isPhone: boolean)}
	<div class="palette" class:phone={isPhone}>
		<div class="field-row">
			<div class="field">
				<Icon name="search" size={18} />
				<input bind:this={input} type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant="palette-option-{active}" aria-label="Search notes" placeholder="Search notes" bind:value={q} oninput={typed} onkeydown={navigate} autocomplete="off" spellcheck="false" />
				{#if !isPhone}<kbd class="hint" aria-hidden="true">Esc</kbd>{/if}
			</div>
			{#if isPhone}
				<button class="close" type="button" aria-label="Close" data-press="round" onclick={() => history.back()}><Icon name="close" size={18} /></button>
			{/if}
		</div>
		<div class="host">
			<div class="body" id="palette-list" role="listbox" aria-label="Results">
				{#if term}
					{#if hits.length}
						<div role="group" aria-label="Notes">
							<div class="head"><p class="ruled figures">Notes <span class="count">· {hits.length} {hits.length === 1 ? 'result' : 'results'}</span></p>{@render position()}</div>
							<div class="rows">
								{#each hits as hit, i (hit.note.id)}
									{@const shown = hitDisplay(hit, titleLine(hit.note.title))}
									<a class="row hit" role="option" id="palette-option-{i}" tabindex="-1" aria-selected={i === active} href="/notes/{hit.note.id}" onclick={() => (leaving = true)} onpointermove={() => (active = i)}>
										<span class="pos" aria-hidden="true">{pad(i + 1)}</span>
										<span class="stack">
											<span class="title">{#if hit.note.icon}<span class="emoji" aria-hidden="true">{hit.note.icon}</span>{/if}{#if shown.title}<Highlight parts={shown.title} />{:else}{titleLine(hit.note.title)}{/if}</span>
											<span class="snippet">{#if shown.snippet}<Highlight parts={shown.snippet} />{:else}{hit.note.snippet || COPY.emptyNote}{/if}</span>
										</span>
										{#if i === active}{@render arrow()}{/if}
									</a>
								{/each}
							</div>
						</div>
					{:else if failed === term}
						<p class="none failed" role="status">{COPY.loadFailed}</p>
					{:else if answered === term}
						<div class="none"><NoMatch query={term} clamp /></div>
					{/if}
				{:else}
					<div role="group" aria-labelledby="palette-recent">
						<div class="head"><p class="ruled" id="palette-recent">Recent</p>{#if recent.length}{@render position()}{/if}</div>
						<div class="rows">
							{#each recent as note, i (note.id)}
								<a class="row" role="option" id="palette-option-{i}" tabindex="-1" aria-selected={i === active} href="/notes/{note.id}" onclick={() => (leaving = true)} onpointermove={() => (active = i)}>
									<span class="pos" aria-hidden="true">{pad(i + 1)}</span>
									<span class="stack">
										<span class="title">{#if note.icon}<span class="emoji" aria-hidden="true">{note.icon}</span>{/if}{titleLine(note.title)}</span>
									</span>
									<span class="end">
										<span class="aside figures">{relativeTime(note.updatedAt)}</span>
										{#if i === active}{@render arrow()}{/if}
									</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}
				<div role="group" aria-labelledby="palette-actions">
					<div class="head"><p class="ruled" id="palette-actions">Actions</p></div>
					<div class="rows">
						{#each actions as action, i (action.label)}
							{@const at = notes.length + i}
							<button class="row act" type="button" role="option" id="palette-option-{at}" aria-selected={at === active} tabindex="-1" onpointermove={() => (active = at)} onclick={() => choose(at)}>
								<span class="dot"><Icon name={action.icon} size={16} /></span><span class="title">{action.label}</span>
							</button>
						{/each}
						{#if seeAll}
							<a class="see-all" role="option" id="palette-option-{total - 1}" tabindex="-1" aria-selected={active === total - 1} href={seeAll} onclick={() => (leaving = true)} onpointermove={() => (active = total - 1)}>
								<span>{COPY.seeAll}</span>{@render arrow()}
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#if phone.current}
	<Sheet open={palette.open} side="full" label="Search" onclose={closePalette}>
		{@render body(true)}
	</Sheet>
{:else if palette.open}
	<div class="overlay" role="presentation" use:portal onpointerdown={(e) => e.target === e.currentTarget && closePalette()}>
		<div class="panel" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1" onkeydown={keys}>
			{@render body(false)}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
		background: var(--surface-tint-strong);
	}

	.panel {
		position: absolute;
		inset-block-start: 12dvh;
		inset-inline: var(--space-4);
		max-inline-size: calc(var(--measure) * 0.85);
		max-block-size: 76dvh;
		margin-inline: auto;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		overflow: hidden;
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
	}

	.palette {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto minmax(0, 1fr);
		gap: var(--space-2-5);
		min-block-size: 0;
		min-inline-size: 0;
		padding: var(--space-2-5);
	}

	.palette.phone {
		flex: 1;
		padding: var(--space-3) var(--space-3-5);
		background: var(--surface-frame-strong);
	}

	.field-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.field {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-inline-size: 0;
		padding-inline: var(--space-5) var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-secondary);
	}

	/* one ring: the field's own edge turns into the focus ring, instead of an outline around the control ring */
	.field:has(input:focus-visible) {
		outline: var(--stroke-strong) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--stroke-strong));
	}

	input {
		flex: 1;
		min-inline-size: 0;
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}

	input:focus-visible {
		outline: none;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.hint {
		display: none;
		flex: none;
		place-items: center;
		min-block-size: var(--space-7);
		padding-inline: var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink-secondary);
		font-family: var(--font-ui);
		font-size: var(--type-caption-size);
	}

	@media (pointer: fine) and (min-width: 768px) {
		.hint {
			display: grid;
		}
	}

	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		color: var(--ink);
	}

	.host {
		display: grid;
		min-block-size: 0;
	}

	.body {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-3) var(--space-2) var(--space-2);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		overflow-y: auto;
		overscroll-behavior: contain;
		min-block-size: 0;
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin-block-end: var(--space-1);
		margin-inline: var(--space-2) var(--space-3);
		color: var(--ink-secondary);
	}

	.count {
		letter-spacing: normal;
		text-transform: none;
		font-weight: var(--weight-regular);
	}

	.rows {
		display: grid;
		gap: var(--space-0-5);
	}

	.row {
		display: grid;
		grid-template-columns: 2.5ch minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-3);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-3-5);
		border: 0;
		border-radius: var(--radius-panel);
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		text-decoration: none;
	}

	button.row {
		inline-size: 100%;
		cursor: pointer;
	}

	.row.act {
		grid-template-columns: auto minmax(0, 1fr);
		padding-inline-start: var(--space-1-5);
	}

	.row[aria-selected='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.row[aria-selected='true'] :is(.snippet, .aside, .pos) {
		color: var(--ink-on-inverse-secondary);
	}

	.row[aria-selected='true'] :global(mark) {
		background: var(--surface-inverse-tint-strong);
		color: var(--ink-on-inverse);
	}

	.row[aria-selected='true'] .dot {
		background: var(--surface-raised);
	}

	@media (hover: hover) {
		.row[aria-selected='false']:hover {
			background: var(--surface-sunken);
		}
	}

	.pos {
		align-self: start;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-title-line);
		font-variant-numeric: var(--numeric-figures);
		letter-spacing: 0.06em;
	}

	.row:not(.hit) .pos {
		align-self: center;
	}

	.stack {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	.title {
		min-inline-size: 0;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.emoji {
		margin-inline-end: var(--space-1-5);
	}

	.snippet {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
	}

	.end {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.aside {
		padding-inline-end: var(--space-2);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		white-space: nowrap;
	}

	.aside:has(+ .circle) {
		padding-inline-end: 0;
	}

	.circle {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-8);
		block-size: var(--space-8);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}

	.dot {
		display: grid;
		place-items: center;
		inline-size: var(--space-8);
		block-size: var(--space-8);
		border-radius: var(--radius-round);
		background: var(--surface-control-solid);
		color: var(--ink);
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		justify-self: start;
		gap: var(--space-3);
		margin: var(--space-2) 0 0 var(--space-1-5);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-5);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		text-decoration: none;
	}

	/* the selected pill keeps its ring so it reads as chosen against the charcoal of its own fill */
	.see-all[aria-selected='true'] {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.none {
		padding: var(--space-5) var(--space-3);
	}

	.failed {
		color: var(--ink-secondary);
		font-size: var(--type-body-s-size);
	}
</style>
