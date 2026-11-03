<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockTree from './MockTree.svelte';
	import { tags, tree } from './fixtures.ts';

	let { active = 'home' }: { active?: 'home' | 'search' | 'tree' } = $props();
</script>

<GlassPanel as="aside" class="sidebar" data-sidebar aria-label="Sidebar">
	<div class="head">
		<a class="brand" href="#home"><span class="mark" aria-hidden="true">n</span><span class="wordmark">Notes</span></a>
		<button class="collapse" type="button" aria-label="Collapse sidebar"><Icon name="sidebar" size={18} /></button>
	</div>

	<nav class="nav" aria-label="Main">
		<a class="item" class:active={active === 'home'} href="#home"><Icon name="home" size={19} /><span>Home</span></a>
		<a class="item" class:active={active === 'search'} href="#search"><Icon name="search" size={19} /><span>Search</span><kbd>⌘K</kbd></a>
		<a class="item" href="#new"><Icon name="plus" size={19} /><span>New note</span></a>
	</nav>

	<div class="scroll">
		<section>
			<div class="section-head"><p class="eyebrow">Folders</p><button type="button" aria-label="New folder"><Icon name="plus" size={16} /></button></div>
			<MockTree items={tree} />
		</section>

		<section>
			<div class="section-head"><p class="eyebrow">Tags</p></div>
			<ul class="tags">
				{#each tags as tag (tag.name)}
					<li><a href="#tag"><Icon name="tag" size={16} /><span class="name">{tag.name}</span><span class="count tnum">{tag.count}</span></a></li>
				{/each}
			</ul>
		</section>
	</div>
</GlassPanel>

<style>
	:global(.sidebar) {
		position: fixed;
		z-index: 20;
		inset-block: var(--s-4);
		inset-inline-start: var(--s-4);
		display: none;
		flex-direction: column;
		inline-size: var(--sidebar-w);
		padding: var(--s-4) var(--s-3);
		gap: var(--s-4);
	}

	@media (min-width: 1024px) {
		:global(.sidebar) {
			display: flex;
		}
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--s-2) var(--s-1);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
	}

	.mark {
		display: grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--r-pill);
		background: var(--ink);
		color: var(--surface);
		font-family: var(--font-display);
		font-size: 19px;
		font-style: italic;
		font-weight: 500;
		line-height: 1;
		padding-block-end: 3px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 420;
		letter-spacing: -0.015em;
	}

	.collapse,
	.section-head button {
		display: inline-grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
	}

	.collapse:hover,
	.section-head button:hover {
		background: var(--row-hover);
	}

	.nav {
		display: grid;
		gap: var(--s-1);
	}

	.item {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-block-size: 40px;
		padding-inline: var(--s-3);
		border-radius: var(--r-pill);
		font-weight: 500;
	}

	.item:hover:not(.active) {
		background: var(--row-hover);
	}

	.item.active {
		background: var(--ink);
		color: var(--surface);
	}

	kbd {
		margin-inline-start: auto;
		font: inherit;
		font-size: var(--t-small);
		letter-spacing: 0.04em;
		color: var(--ink-2);
	}

	.scroll {
		display: grid;
		flex: 1;
		align-content: start;
		gap: var(--s-5);
		min-block-size: 0;
		margin-inline: calc(var(--s-1) * -1);
		padding-inline: var(--s-1);
		overflow-y: auto;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--s-2) var(--s-1);
		margin-block-end: var(--s-1);
	}

	.tags a {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-2);
		border-radius: var(--r-md);
		color: var(--ink-2);
	}

	.tags a:hover {
		background: var(--row-hover);
	}

	.tags .name {
		flex: 1;
	}

	.count {
		font-size: var(--t-small);
	}
</style>
