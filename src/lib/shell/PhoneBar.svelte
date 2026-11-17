<script lang="ts">
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import { hideOnType } from '#lib/components/scroll-cue/cue.ts';
	import { openPalette } from '#lib/search/palette.svelte.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { newNote } from './capture.ts';

	const path = $derived(page.url.pathname);
	const section = $derived(
		path.startsWith('/folders') ? 'folders' : path === '/' ? 'home' : path.startsWith('/search') ? 'search' : null
	);

	let hidden = $state(false);
	function watch(dock: HTMLElement) {
		const sync = () => (hidden = dock.hasAttribute('data-hidden'));
		const observer = new MutationObserver(sync);
		observer.observe(dock, { attributes: true, attributeFilter: ['data-hidden'] });
		sync();
		return { destroy: () => observer.disconnect() };
	}
</script>

<nav class="dock" aria-label="Bottom bar" aria-hidden={hidden ? 'true' : undefined} inert={hidden} use:hideOnType use:watch>
	<ul class="dock-tabs" data-pill>
		<li>
			<a href="/" aria-current={section === 'home' ? 'page' : undefined} data-press><Icon name="home" size={20} /><span>Home</span></a>
		</li>
		<li>
			<a href="/folders" aria-current={section === 'folders' ? 'page' : undefined} data-press><Icon name="folder" size={20} /><span>Folders</span></a>
		</li>
		<li>
			<button type="button" aria-current={section === 'search' ? 'page' : undefined} data-press onclick={openPalette}><Icon name="search" size={20} /><span>Search</span></button>
		</li>
	</ul>
	<button type="button" class="dock-add" aria-label={COPY.newNote} data-press="round" data-focus="halo" onclick={() => newNote()}><Icon name="plus" size={24} stroke={2} /></button>
</nav>

<style>
	.dock-tabs button {
		position: relative;
		inline-size: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-0-5);
		min-block-size: calc(var(--target-touch) + var(--space-2));
		padding: 0 var(--space-1);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: var(--type-overline-size);
		line-height: 1.1;
		font-weight: var(--weight-medium);
	}

	.dock-tabs button > span {
		max-inline-size: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dock-tabs button[aria-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	@media (max-width: 359px) {
		.dock-tabs button > span {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			clip-path: inset(50%);
		}
	}
</style>
