<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { newNote } from '#lib/notes/api.ts';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import Icon from '#lib/ui/Icon.svelte';
</script>

<section class="hero" data-hero>
	<Eyebrow>Notes — Folders — Tags</Eyebrow>
	<h1 class="display"><span data-line>Every note,</span> <span data-line><em>in its place</em></span></h1>
	<div class="actions">
		<button type="button" class="glass search" onclick={openPalette}>
			<Icon name="search" size={20} />
			<span class="placeholder">Search notes</span>
			<kbd>⌘K</kbd>
		</button>
		<Button onclick={() => newNote()}>{COPY.newNote}</Button>
	</div>
</section>

<style>
	.hero {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
		padding-block-start: var(--s-4);
	}

	@media (min-width: 1024px) {
		.hero {
			padding-block-start: var(--s-7);
		}
	}

	[data-line] {
		display: block;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
		inline-size: 100%;
		margin-block-start: var(--s-2);
	}

	.search {
		display: flex;
		flex: 1 1 280px;
		align-items: center;
		gap: var(--s-3);
		max-inline-size: 460px;
		min-block-size: 52px;
		padding-inline: var(--s-5) var(--s-4);
		border: 0;
		border-radius: var(--r-pill);
		color: var(--ink);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}

	.placeholder {
		flex: 1;
		color: var(--ink-2);
	}

	kbd {
		padding: 2px var(--s-2);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		background: var(--chip-bg);
		font: inherit;
		font-size: 12px;
		color: var(--ink-2);
	}
</style>
