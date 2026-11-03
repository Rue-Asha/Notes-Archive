<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import FolderTree from '#lib/folders/FolderTree.svelte';
	import type { Tree } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import Sheet from '#lib/ui/Sheet.svelte';

	let { open, tree, tags, onclose }: { open: boolean; tree: Tree; tags?: Snippet; onclose(): void } = $props();

	afterNavigate(() => {
		if (open) onclose();
	});
</script>

<Sheet {open} side="left" label="Folders" {onclose}>
	<div class="head">
		<div class="brand">
			<a class="mark" href="/" aria-label="Home">n</a>
			<h2 class="wordmark">Folders</h2>
		</div>
		<button type="button" aria-label="Close" onclick={() => history.back()}><Icon name="close" size={18} /></button>
	</div>
	<div class="scroll">
		<FolderTree {tree} onnavigate={onclose} />
		{@render tags?.()}
	</div>
</Sheet>

<style>
	.head {
		display: flex;
		flex: none;
		align-items: center;
		justify-content: space-between;
		padding: var(--s-4) var(--s-4) var(--s-3);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s-3);
	}

	/* the approved mockup floats the drawer inset from the edges, clear of the bottom bar */
	:global(.sheet.glass.left) {
		inset-block: var(--s-2) 96px;
		inset-inline-start: var(--s-2);
		inline-size: min(84vw, 320px);
		padding-block-start: 0;
		border-radius: var(--r-2xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
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
		padding-inline: var(--s-3);
		padding-block-end: var(--s-4);
		overflow-y: auto;
	}

</style>
