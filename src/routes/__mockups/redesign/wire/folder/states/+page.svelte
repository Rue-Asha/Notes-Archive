<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
		import { dataFor } from '../../tree/data.ts';
	import FolderBody, { type FolderView } from '../FolderBody.svelte';

	const data = $derived(dataFor(page.url));
	const base = $derived(data.folder);
	const one = $derived({ folders: [{ id: 21, name: base.folders[0].name, noteCount: 1 }], notes: base.notes.slice(0, 1) });

	const states = $derived<{ title: string; note: string; folder: FolderView }[]>([
		{ title: 'Empty', note: 'No cover, nothing inside', folder: { ...base, cover: false, folders: [], notes: [] } },
		{ title: 'Only sub-folders', note: 'Notes section omitted', folder: { ...base, cover: false, notes: [] } },
		{ title: 'Only notes', note: 'Folders section omitted, cover set', folder: { ...base, cover: true, folders: [] } },
		{ title: 'One of each', note: '1 folder, 1 note', folder: { ...base, cover: false, ...one } },
		{ title: 'Top-level folder', note: 'Back names "Folders"', folder: { ...base, cover: false, path: [] } },
		{ title: 'Nested folder', note: 'Back names the parent', folder: { ...base, cover: true, path: base.path.length ? base.path : ['Reisen', 'Japan'] } }
	]);
</script>

<svelte:head><title>Folder page states (wireframe)</title></svelte:head>

<Frame current="folders">
	<div class="gallery">
		<h1>Folder page states</h1>
		<p class="lede">Each level on the phone, at phone width. Cover, sections and counts follow what the folder holds.</p>
		<ul>
			{#each states as s (s.title)}
				<li>
					<div class="cap"><h2>{s.title}</h2><p>{s.note}</p></div>
					<div class="device"><FolderBody folder={s.folder} worst={data.worst} posture="phone" /></div>
				</li>
			{/each}
		</ul>
	</div>
</Frame>

<style>
	.gallery {
		display: grid;
		gap: var(--space-5);
	}
	h1 {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.lede {
		color: var(--ink-secondary);
		max-inline-size: 60ch;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-6);
		align-items: start;
	}
	li {
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
	.device {
		max-inline-size: 24rem;
		padding: var(--space-3) var(--space-4) var(--space-5);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-card);
		background: var(--surface-sunken);
	}
</style>
