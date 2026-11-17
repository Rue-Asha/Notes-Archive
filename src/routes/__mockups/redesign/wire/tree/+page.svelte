<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockTag } from '../../fixtures.ts';
	import PhoneBar from './PhoneBar.svelte';
	import SideTree from './SideTree.svelte';
	import { dataFor, resolveTree, wireTree } from './data.ts';

	const live = $derived(dataFor(page.url));
	const tree = $derived(wireTree(live));
	const deepTree = wireTree(mockData(new URL('http://mock/?data=worst')));
	const noTags: MockTag[] = [];
	const states = $derived([
		{ title: 'Top level', note: 'No path row', view: resolveTree(tree) },
		{ title: 'Focused folder', note: 'Path row up, subtree below', view: resolveTree(tree, { focus: live.worst ? 99 : 1 }) },
		{ title: 'Note current', note: 'Ancestors between focus and note open', view: resolveTree(tree, { focus: live.worst ? 103 : 1, note: live.worst ? 900 : 5 }) },
		{ title: 'Note opened from search', note: 'Focus follows the note’s folder', view: resolveTree(tree, { note: live.worst ? 900 : 5 }) },
		{ title: '12 levels deep', note: 'Middle of the path held back (worst-case data)', view: resolveTree(deepTree, { focus: 99 }) },
		{ title: '12 levels, path opened', note: 'Every ancestor in full', view: resolveTree(deepTree, { focus: 99 }), moreOpen: true },
		{ title: 'Folded to the rail', note: 'Expand, Home, Search, New note', view: resolveTree(tree), rail: true },
		{ title: 'Sort menu open', note: 'Current mode marked', view: resolveTree(tree), menuOpen: true },
		{ title: 'No folders yet', note: 'Tags footer absent without tags', view: resolveTree([], { empty: true }), tags: noTags }
	]);
</script>

<svelte:head><title>Tree states (wireframe)</title></svelte:head>

<Frame>
	<div class="gallery">
		<h1>Tree states</h1>
		<p class="lede">The side tree on desktop, in every state it takes. Tags sit under the tree and scroll on their own.</p>
		<ul class="states">
			{#each states as s (s.title)}
				<li>
					<div class="cap"><h2>{s.title}</h2><p>{s.note}</p></div>
					<div class="slot" data-rail={s.rail || undefined}>
						<SideTree view={s.view} tags={s.tags ?? live.tags} sort={live.sort} worst={live.worst} rail={s.rail ?? false} menuOpen={s.menuOpen} moreOpen={s.moreOpen} />
					</div>
				</li>
			{/each}
		</ul>

		<h2 class="sub">Phone bar</h2>
		<p class="lede">Home · Folders · Search as pills, a round New note beside them. The current section is the dark pill.</p>
		<ul class="bars">
			{#each [['home', 'On Home'], ['folders', 'On Folders and any folder'], ['search', 'On Search'], [null, 'On a note, tag page']] as [key, label] (label)}
				<li>
					<div class="cap"><p>{label}</p></div>
					<div class="device"><PhoneBar current={key as 'home' | 'folders' | 'search' | null} worst={live.worst} flow /></div>
				</li>
			{/each}
		</ul>
	</div>
</Frame>

<style>
	.gallery {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
	}
	h1 {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}
	.sub {
		margin-block-start: var(--space-4);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.lede {
		color: var(--ink-secondary);
		max-inline-size: 60ch;
	}
	.states {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17.5rem), 1fr));
		gap: var(--space-6) var(--space-5);
		align-items: start;
	}
	.bars {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5);
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
	.slot {
		block-size: 36rem;
		max-inline-size: 17.5rem;
	}
	.slot[data-rail] {
		inline-size: var(--rail-width);
		block-size: 16rem;
	}
	.device {
		padding: var(--space-3);
		border: var(--stroke-hairline) solid var(--edge-control);
		border-radius: var(--radius-card);
		background: var(--surface-sunken);
	}
</style>
