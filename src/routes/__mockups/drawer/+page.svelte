<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockBottomBar from '#lib/mockups/MockBottomBar.svelte';
	import MockNoteCard from '#lib/mockups/MockNoteCard.svelte';
	import MockTree from '#lib/mockups/MockTree.svelte';
	import { notes, tags, tree } from '#lib/mockups/fixtures.ts';
</script>

<svelte:head><title>Drawer · Notes Archive mockups</title></svelte:head>

<div class="backdrop" data-screen="drawer">
	<div class="stage">
		<div class="content">
			<p class="eyebrow">Notes — Folders — Tags</p>
			<h1 class="display">Every note,<br /><em>in its place</em></h1>
			{#each notes.slice(0, 2) as note (note.id)}<MockNoteCard {note} />{/each}
		</div>

		<div class="scrim"></div>
		<GlassPanel as="aside" strong class="drawer" data-drawer role="dialog" aria-label="Folders">
			<div class="head">
				<a class="brand" href="#home"><span class="mark" aria-hidden="true">n</span><span class="wordmark">Folders</span></a>
				<button type="button" aria-label="Close"><Icon name="close" size={18} /></button>
			</div>
			<div class="scroll">
				<MockTree items={tree} />
				<div class="tags">
					<p class="eyebrow">Tags</p>
					<ul>
						{#each tags.slice(0, 4) as tag (tag.name)}
							<li><Icon name="tag" size={16} /><span class="name">{tag.name}</span><span class="tnum">{tag.count}</span></li>
						{/each}
					</ul>
				</div>
			</div>
			<a class="new-folder" href="#folder"><Icon name="plus" size={18} />New folder</a>
		</GlassPanel>

		<MockBottomBar active="folders" fixed={false} />
	</div>
</div>

<style>
	.backdrop {
		display: grid;
		place-items: center;
		min-block-size: 100dvh;
	}

	.stage {
		position: relative;
		inline-size: 100%;
		block-size: 100dvh;
		overflow: hidden;
		isolation: isolate;
	}

	@media (min-width: 600px) {
		.stage {
			inline-size: 390px;
			block-size: 844px;
			max-block-size: calc(100dvh - var(--s-6));
			border-radius: 44px;
			background: var(--ground);
			box-shadow: var(--shadow-float), 0 0 0 8px var(--ink);
		}
	}

	.content {
		display: grid;
		gap: var(--s-4);
		padding: var(--s-9) var(--s-4) 0;
	}

	.content h1 {
		margin-block-end: var(--s-3);
	}

	.scrim {
		position: absolute;
		inset: 0;
		z-index: 40;
		background: color-mix(in srgb, var(--ink) 18%, transparent);
	}

	:global(.drawer) {
		position: absolute;
		z-index: 50;
		inset-block: var(--s-2) 96px;
		inset-inline-start: var(--s-2);
		display: flex;
		flex-direction: column;
		inline-size: min(84%, 320px);
		padding: var(--s-4) var(--s-3);
		gap: var(--s-4);
		border-radius: var(--r-2xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--s-2);
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
		line-height: 1;
		padding-block-end: 3px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 420;
		letter-spacing: -0.015em;
	}

	.head button {
		display: inline-grid;
		place-items: center;
		inline-size: var(--control);
		block-size: var(--control);
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
	}

	.scroll {
		display: grid;
		flex: 1;
		align-content: start;
		gap: var(--s-5);
		min-block-size: 0;
		overflow-y: auto;
	}

	.tags .eyebrow {
		padding: 0 var(--s-2) var(--s-1);
	}

	.tags li {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 36px;
		padding-inline: var(--s-2);
		color: var(--ink-2);
	}

	.name {
		flex: 1;
	}

	.new-folder {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		min-block-size: var(--control);
		border: 1px solid var(--line);
		border-radius: var(--r-pill);
		font-weight: 600;
	}
</style>
