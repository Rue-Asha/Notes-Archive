<script lang="ts">
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import { newNote } from '#lib/notes/api.ts';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import { softKeyboard } from '#lib/shell/keyboard.svelte.ts';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { foldersOpen, onfolders }: { foldersOpen: boolean; onfolders(): void } = $props();

	const home = $derived(page.url.pathname === '/');
</script>

<GlassPanel as="nav" class="bottom-bar" data-bottom-bar aria-label="Bottom bar" aria-hidden={softKeyboard.open ? 'true' : undefined} inert={softKeyboard.open}>
	<a class="cell" class:active={home && !foldersOpen} href="/" aria-current={home ? 'page' : undefined}><Icon name="home" size={22} /><span>Home</span></a>
	<button class="cell" type="button" onclick={openPalette}><Icon name="search" size={22} /><span>Search</span></button>
	<button class="cell new" type="button" aria-label={COPY.newNote} onclick={() => newNote()}>
		<span class="round"><Icon name="plus" size={24} stroke={2} /></span>
	</button>
	<button class="cell" class:active={foldersOpen} type="button" aria-haspopup="dialog" onclick={onfolders}><Icon name="folder" size={22} /><span>Folders</span></button>
</GlassPanel>

<style>
	:global(.bottom-bar) {
		position: fixed;
		z-index: 30;
		inset-inline: var(--s-3);
		inset-block-end: calc(var(--s-3) + env(safe-area-inset-bottom));
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: center;
		block-size: 68px;
		padding-inline: var(--s-2);
		border-radius: var(--r-2xl);
		transition: transform var(--d-base) var(--ease-out);
	}

	:global(.bottom-bar[aria-hidden='true']) {
		transform: translateY(calc(100% + var(--s-3) + env(safe-area-inset-bottom)));
	}

	@media (min-width: 1024px) {
		:global(.bottom-bar) {
			display: none;
		}
	}

	.cell {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 2px;
		min-block-size: var(--control);
		padding: 0;
		border: 0;
		border-radius: var(--r-xl);
		background: transparent;
		color: var(--ink-2);
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.cell.active {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
		color: var(--ink);
	}

	.new {
		margin-block: calc(var(--s-4) * -1);
	}

	.round {
		display: grid;
		place-items: center;
		inline-size: 56px;
		block-size: 56px;
		border-radius: var(--r-pill);
		background: var(--ink);
		color: var(--surface);
		box-shadow: var(--shadow-float);
	}
</style>
