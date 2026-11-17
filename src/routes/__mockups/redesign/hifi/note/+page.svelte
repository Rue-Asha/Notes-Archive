<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Blocks from '../editor/Blocks.svelte';
	import { stressBlocks } from '../editor/data.ts';
	import NoteCard from './NoteCard.svelte';
	import State from './State.svelte';
	import { LONG_TAG, LONG_TITLE, TWELVE_LINES, noteView, type NoteView, type Status } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const view = $derived(noteView(data));
	const blocks = $derived([...data.note.blocks, ...stressBlocks(data)]);
	const fresh: NoteView = { title: '', icon: null, path: ['Travel'], created: '2026-11-14T09:00:00.000Z', updated: '2026-11-14T09:00:00.000Z', tags: [], pinned: false };
	const statuses: [Status, string][] = [
		['saving', 'Saving…'],
		['saved', 'Saved'],
		['error', 'Couldn’t save — try again'],
		['deleted', 'This note was deleted']
	];
	const POOL = ['reference', 'research', 'retro', 'recipes', 'reading', 'receipts', 'remote', 'renovation', 'review', 'regional'];
	const typed = 're';
	const matches = $derived([...(data.worst ? [LONG_TAG] : []), ...POOL].filter((t) => t.toLowerCase().includes(typed) && !view.tags.includes(t)));
	const typing = $derived({ text: typed, list: matches.slice(0, 8), total: matches.length, active: 1 });
	const stub = $derived(data.note.blocks.filter((b) => b.type === 'paragraph').slice(0, 1));
</script>

<svelte:head><title>Note · hi-fi</title></svelte:head>

<Frame>
	<div class="screen-body note-page">
		<NoteCard {view}>
			{#snippet body()}<Blocks {blocks} />{/snippet}
		</NoteCard>

		<div class="states">
			<h2>States</h2>
			<State label="Phone — properties collapsed" note="One summary line: path · tag count. Tapping it expands the rows.">
				<NoteCard {view} expanded={false}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard>
			</State>
			<State label="Phone — properties expanded">
				<NoteCard {view} expanded={true}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard>
			</State>
			{#each statuses as [status, label] (status)}
				<State label={`Save status — ${label}`} note={status === 'error' ? 'The status is the retry button; one toast with the same text per run of failures.' : status === 'deleted' ? 'An alert in the card; the note stops saving and its content is inert.' : 'The status is not a live region.'}>
					<NoteCard {view} {status} expanded={false}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard>
				</State>
			{/each}
			<State label="Tags — typing, suggestions" note="Matching existing tags not already on the note, at most 8. Arrow keys move, Enter picks; Enter or comma on typed text adds it as new.">
				<NoteCard {view} expanded={true} {typing}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard>
			</State>
			<State label="New note" note="Title focused, placeholders shown; discarded silently when left untouched.">
				<NoteCard view={fresh} focusTitle expanded={true} />
			</State>
			<State label="Title — focused" note="The field is plain text: while it has focus the accent word drops back to ink; it returns on blur.">
				<NoteCard {view} focusTitle expanded={false} />
			</State>
			<State label="Title — 200+ characters" note="Steps down one role and grows with its content; no horizontal scroll.">
				<NoteCard view={{ ...view, title: LONG_TITLE }} expanded={false} />
			</State>
			<State label="Title — 12 short lines" note="Enter inserts a line break; Cmd/Ctrl+Enter or ArrowDown on the last line moves to the body.">
				<NoteCard view={{ ...view, title: TWELVE_LINES }} expanded={false} />
			</State>
		</div>
	</div>
</Frame>

<style>
	.note-page { gap: var(--space-8); min-inline-size: 0; }
	.states { display: grid; gap: var(--space-8); padding-block-start: var(--space-8); box-shadow: var(--rule-above); }
</style>
