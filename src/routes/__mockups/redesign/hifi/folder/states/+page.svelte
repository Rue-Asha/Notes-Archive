<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor } from '../../tree/data.ts';
	import FolderBody, { type FolderView } from '../FolderBody.svelte';

	const data = $derived(dataFor(page.url));
	const base = $derived(data.folder);
	// the contract's example: one sub-folder holding two notes plus four of the folder's own reads "1 folder · 6 notes"
	const nested = $derived({ folders: [{ id: 21, name: base.folders[0].name, noteCount: 2 }], notes: base.notes.slice(0, 4) });
	const single = $derived({ folders: [{ id: 22, name: base.folders[0].name, noteCount: 0 }], notes: base.notes.slice(0, 1) });
	const deep = Array.from({ length: 12 }, (_, i) => `Level ${i + 1} folder`);

	const states = $derived<{ title: string; note: string; folder: FolderView; posture?: 'phone' | 'wide'; opened?: boolean }[]>([
		{ title: 'Empty', note: 'No cover, nothing inside', folder: { ...base, cover: false, folders: [], notes: [] } },
		{ title: 'Only sub-folders', note: 'Notes section omitted', folder: { ...base, cover: false, notes: [] } },
		{ title: 'Only notes', note: 'Folders section omitted, cover set', folder: { ...base, cover: true, folders: [] } },
		{ title: 'One of each', note: 'Counts run through the sub-folders: 1 folder holding 2 notes plus 4 of its own reads “1 folder · 6 notes”', folder: { ...base, cover: false, ...nested } },
		{ title: 'Multi-word name', note: 'One accent word, the last; the rest stays ink', folder: { ...base, cover: true, name: data.worst ? 'Steuern und Belege der Donaudampfschifffahrtsgesellschaft' : 'Summer in Lisbon' } },
		{ title: 'Singular counts', note: '“1 folder · 1 note”', folder: { ...base, cover: false, ...single } },
		{ title: 'New folder', note: 'Created as “Untitled folder”, listed at once and in rename mode: Enter or blur commits, Escape cancels, empty keeps “Untitled folder”', folder: { ...base, cover: false, folders: [{ id: 90, name: 'Untitled folder', noteCount: 0, renaming: true }, ...base.folders] } },
		{ title: 'Cover too large', note: 'A cover over 16 MB: toast, the folder keeps what it had', folder: { ...base, cover: false, toast: { message: 'That image is too large', kind: 'error' } } },
		{ title: 'Cover is not an image', note: 'Wrong file type: toast, nothing changes', folder: { ...base, cover: true, toast: { message: 'That file isn’t an image', kind: 'error' } } },
		{ title: 'Top-level folder', note: 'Back names "Folders"', folder: { ...base, cover: false, path: [] } },
		{ title: 'Nested folder', note: 'Back names the parent', folder: { ...base, cover: true, path: base.path.length ? base.path : ['Reisen', 'Japan'] } },
		{ title: 'Deep path — 12 levels', note: 'Desktop breadcrumb: first and last two ancestors, the middle held back behind “…”', folder: { ...base, cover: false, path: deep }, posture: 'wide' },
		{ title: 'Deep path — opened', note: '“…” shows every ancestor in full; “Shorten path” folds it back', folder: { ...base, cover: false, path: deep }, posture: 'wide', opened: true }
	]);
</script>

<svelte:head><title>Folder page states (hi-fi)</title></svelte:head>

<Frame current="folders">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Folder page</li></ul>
			<h1>Every <em class="accent-word">state</em></h1>
			<p class="lede">Each drill-down level at phone width. Cover, sections and counts follow what the folder holds.</p>
		</div>
	</header>
	<ul class="states screen-body">
		{#each states as s (s.title)}
			<li class:wide={s.posture === 'wide'}>
				<div class="cap"><h2>{s.title}</h2><p>{s.note}</p></div>
				<div class="device" class:wide={s.posture === 'wide'}><FolderBody folder={s.folder} worst={data.worst} posture={s.posture ?? 'phone'} opened={s.opened} /></div>
			</li>
		{/each}
	</ul>
</Frame>

<style>
	.states.screen-body {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-8) var(--space-6);
	}
	.states > li {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.cap h2 {
		font-family: var(--font-ui);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		letter-spacing: 0;
	}
	.cap p {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.states > li.wide {
		grid-column: 1 / -1;
	}
	.device.wide {
		max-inline-size: 48rem;
	}
	.device {
		--bleed-x: var(--space-4);
		--bleed-t: var(--space-3);
		position: relative;
		overflow: hidden;
		max-inline-size: 24rem;
		padding: var(--space-3) var(--space-4) var(--space-5);
		border-radius: var(--radius-card);
		background: var(--surface-glass);
		box-shadow: var(--shadow-rim);
	}
	.device :global(h1) {
		font-size: var(--type-display-xl-size-compact);
	}
	.device :global(h1[data-long]) {
		font-size: var(--type-display-l-size);
	}
</style>
