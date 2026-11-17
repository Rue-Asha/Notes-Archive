<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Blocks from '../editor/Blocks.svelte';
	import { stressBlocks } from '../editor/data.ts';
	import NoteCard from './NoteCard.svelte';
	import Specimen from './Specimen.svelte';
	import { LONG_TITLE, TWELVE_LINES, noteView, type NoteView, type Status } from './data.ts';
	import './wire.css';

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
	const stub = $derived(data.note.blocks.filter((b) => b.type === 'paragraph').slice(0, 1));
</script>

<svelte:head><title>Note · wireframe</title></svelte:head>

<Frame>
	<div class="w-page">
		<NoteCard {view}>
			{#snippet body()}<Blocks blocks={blocks} />{/snippet}
		</NoteCard>

		<div class="w-states">
			<h2>States</h2>
			<Specimen label="Phone — properties collapsed" note="One summary line: path · tag count. Tap expands.">
				<div class="narrow"><NoteCard {view} expanded={false}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard></div>
			</Specimen>
			<Specimen label="Phone — properties expanded">
				<div class="narrow"><NoteCard {view} expanded={true}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard></div>
			</Specimen>
			{#each statuses as [status, label] (status)}
				<Specimen label={`Save status — ${label}`} note={status === 'error' ? 'The status is the retry button; one toast with the same text per run of failures.' : status === 'deleted' ? 'An alert in the build; saving stops.' : 'Not a live region.'}>
					<div class="narrow"><NoteCard {view} {status} expanded={false}>{#snippet body()}<Blocks blocks={stub} />{/snippet}</NoteCard></div>
				</Specimen>
			{/each}
			<Specimen label="New note" note="Title focused, placeholders shown; discarded silently when left untouched.">
				<div class="narrow"><NoteCard view={fresh} focusTitle expanded={true} /></div>
			</Specimen>
			<Specimen label="Title — 200+ characters" note="Grows with its content; no horizontal scroll.">
				<div class="narrow"><NoteCard view={{ ...view, title: LONG_TITLE }} expanded={false} /></div>
			</Specimen>
			<Specimen label="Title — 12 short lines" note="Enter inserts a line break; Cmd/Ctrl+Enter or ArrowDown on the last line moves to the body.">
				<div class="narrow"><NoteCard view={{ ...view, title: TWELVE_LINES }} expanded={false} /></div>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.narrow { min-inline-size: 0; }
</style>
