<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockTag } from '../../fixtures.ts';
	import Dock from './Dock.svelte';
	import SideTree from './SideTree.svelte';
	import Toast from '../ui/Toast.svelte';
	import { dataFor, resolveTree, wireTree } from './data.ts';

	const live = $derived(dataFor(page.url));
	const tree = $derived(wireTree(live));
	const deepTree = wireTree(mockData(new URL('http://mock/?data=worst')));
	const noTags: MockTag[] = [];
	const top = $derived(resolveTree(tree));
	const fresh = $derived({ ...top, nodes: [{ id: 998, name: 'Untitled folder', children: [], notes: [] }, ...top.nodes] });
	let sortToast = $state(true);
	const states = $derived([
		{ title: 'Top level', note: 'No path row', view: resolveTree(tree) },
		{ title: 'Focused folder', note: 'Path row up, subtree below', view: resolveTree(tree, { focus: live.worst ? 99 : 1 }) },
		{ title: 'Note current', note: 'Ancestors between focus and note open', view: resolveTree(tree, { focus: live.worst ? 103 : 1, note: live.worst ? 900 : 5 }) },
		{ title: 'Note opened from search', note: 'Focus follows the note’s folder', view: resolveTree(tree, { note: live.worst ? 900 : 5 }) },
		{ title: '12 levels deep', note: 'Middle of the path held back (worst-case data)', view: resolveTree(deepTree, { focus: 99 }) },
		{ title: '12 levels, path opened', note: 'Every ancestor in full', view: resolveTree(deepTree, { focus: 99 }), moreOpen: true },
		{ title: 'Folded to the rail', note: 'Expand, Home, Search, New note', view: resolveTree(tree), rail: true },
		{ title: 'Sort menu open', note: 'Current mode marked', view: resolveTree(tree), menuOpen: true },
		{ title: 'Sort save fails', note: 'Pick another mode: it shows for a beat, then the saved mode returns and a toast says why', view: resolveTree(tree), sortFails: true },
		{ title: 'Rename a folder', note: 'Inline field “Folder name”. Enter or blur commits, Escape cancels, empty becomes “Untitled folder”', view: top, renameId: top.nodes[0].id },
		{ title: 'New folder', note: 'Created as “Untitled folder”, already in rename mode', view: fresh, renameId: 998 },
		{ title: 'No folders yet', note: 'Tags footer absent without tags', view: resolveTree([], { empty: true }), tags: noTags }
	]);
</script>

<svelte:head><title>Tree states (hi-fi)</title></svelte:head>

<Frame>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shell</li><li>Desktop sidebar</li></ul>
			<h1>Tree <em class="accent-word">states</em></h1>
			<p class="lede">The side tree on desktop, in every state it takes. Tags sit under the tree and scroll on their own.</p>
		</div>
	</header>
	<div class="screen-body gallery">
		<ul class="states">
			{#each states as s (s.title)}
				<li>
					<div class="cap"><h2>{s.title}</h2><p>{s.note}</p></div>
					<div class="slot" data-rail={s.rail || undefined}>
						<SideTree view={s.view} tags={s.tags ?? live.tags} sort={live.sort} worst={live.worst} rail={s.rail ?? false} menuOpen={s.menuOpen} moreOpen={s.moreOpen} renameId={s.renameId} sortFails={s.sortFails} onsortfail={() => (sortToast = true)} />
					</div>
					{#if s.sortFails && sortToast}<div class="toasts" role="status"><Toast kind="error" message="Couldn’t save — try again" /></div>{/if}
				</li>
			{/each}
		</ul>

		<section aria-labelledby="bar-h">
			<h2 class="ruled" id="bar-h">Phone bar</h2>
			<p class="lede">Home · Folders · Search as tabs, a round New note beside them. The current section is the charcoal pill.</p>
			<ul class="bars">
				{#each [['home', 'On Home'], ['folders', 'On Folders and any folder'], ['search', 'On Search'], [null, 'On a note, tag page']] as [key, label] (label)}
					<li>
						<div class="cap"><p>{label}</p></div>
						<Dock current={key as 'home' | 'folders' | 'search' | null} worst={live.worst} specimen />
					</li>
				{/each}
			</ul>
		</section>
	</div>
</Frame>

<style>
	.screen-body.gallery {
		gap: var(--space-9);
	}
	.states {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17.5rem), 1fr));
		gap: var(--space-8) var(--space-6);
		align-items: start;
	}
	.bars {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5);
		margin-block-start: var(--space-4);
	}
	section .lede {
		margin-block-start: var(--space-2);
	}
	.states > li,
	.bars > li {
		display: grid;
		align-content: start;
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
	.toasts {
		max-inline-size: 17.5rem;
	}
	.slot {
		block-size: 44rem;
		max-inline-size: 17.5rem;
	}
	.slot[data-rail] {
		inline-size: var(--rail-width);
		block-size: auto;
	}
</style>
