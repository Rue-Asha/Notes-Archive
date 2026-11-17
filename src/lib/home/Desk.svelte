<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Button from '#lib/components/button/Button.svelte';
	import { newNote } from '#lib/notes/api.ts';
	import NoteGrid from '#lib/notes/NoteGrid.svelte';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import type { NoteCard } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import Pinned from './Pinned.svelte';

	let { pinned, recent }: { pinned: NoteCard[]; recent: NoteCard[] } = $props();
</script>

<div class="desk">
	<div class="seg-bar">
		<button type="button" class="seg search" aria-keyshortcuts="Control+K Meta+K" onclick={openPalette}>
			<Icon name="search" size={20} /><span class="hint">{COPY.searchHint}</span><kbd aria-hidden="true">Ctrl K</kbd>
		</button>
		{#if recent.length}
			<div class="seg-actions">
				<Button variant="primary" arrow onclick={() => newNote()}>{COPY.newNote}</Button>
			</div>
		{/if}
	</div>

	{#if recent.length}
		<div class="lists" class:single={!pinned.length}>
			{#if pinned.length}<Pinned notes={pinned} />{/if}
			<section class="card" aria-labelledby="home-recent" data-recent>
				<div class="card-head"><h2 id="home-recent">Recently edited</h2><span class="card-note">{COPY.noteCount(recent.length)}</span></div>
				<NoteGrid notes={recent} home />
			</section>
		</div>
	{:else}
		<section class="card welcome" aria-labelledby="welcome-title" data-welcome>
			<h2 id="welcome-title">{COPY.welcome}</h2>
			<p>Notes you write live here, filed in folders and found by search.</p>
			<Button variant="secondary" onclick={() => newNote()}><Icon name="plus" size={18} />{COPY.newNote}</Button>
		</section>
	{/if}
</div>

<style>
	.desk {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
	}

	.seg-bar {
		justify-self: stretch;
	}

	.seg.search {
		flex: 1 1 14rem;
		min-inline-size: 0;
		border: 0;
		background: transparent;
		color: var(--ink-secondary);
		font: inherit;
		font-size: var(--type-body-s-size);
		text-align: start;
		border-radius: var(--radius-pill);
	}

	.hint {
		flex: 1;
	}

	kbd {
		padding: var(--space-0-5) var(--space-2);
		border-radius: var(--radius-pill);
		box-shadow: var(--ring-hairline);
		font-family: var(--font-ui);
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}

	/* the phone bar's round "+" captures there, and a keyboard hint means nothing on touch */
	@media (max-width: 767px), (pointer: coarse) {
		kbd {
			display: none;
		}
	}

	@media (max-width: 1023px) {
		.seg-actions {
			display: none;
		}
	}

	@media (hover: hover) {
		.seg.search:hover {
			background: var(--surface-tint);
		}
	}

	.lists {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		grid-template-columns: minmax(0, 1fr);
	}

	@media (min-width: 1100px) {
		.lists:not(.single) {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		}
	}

	.card {
		padding: var(--space-5) var(--space-4) var(--space-4);
		min-inline-size: 0;
	}

	@media (max-width: 359px) {
		.card {
			padding-inline: var(--space-2);
		}
	}

	.card-head {
		margin-block-end: var(--space-3);
		padding-inline: var(--space-2);
	}

	.welcome {
		display: grid;
		justify-items: start;
		gap: var(--space-4);
		padding: var(--space-10) var(--space-8);
	}

	.welcome p {
		max-inline-size: 40ch;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		color: var(--ink-secondary);
	}
</style>
