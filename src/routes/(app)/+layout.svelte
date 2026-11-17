<script lang="ts">
	import '#lib/styles/fingerprint/tokens.css';
	import '#lib/styles/fingerprint/fonts.css';
	import '#lib/styles/fingerprint/base.css';
	import '#lib/styles/fingerprint/motion.css';
	import '#lib/styles/fingerprint/layout.css';
	import '#lib/styles/prose.css';
	import type { Snippet } from 'svelte';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import CommandPalette from '#lib/search/CommandPalette.svelte';
	import PhoneBar from '#lib/shell/PhoneBar.svelte';
	import SideTree from '#lib/shell/SideTree.svelte';
	import { RAIL_SCRIPT } from '#lib/shell/sidebar.ts';
	import { hush, listen } from '#lib/ui/motion.ts';

	let { children }: { children: Snippet } = $props();

	// onNavigate, not beforeNavigate: it runs only once no guard has cancelled the navigation and the page is about to
	// change, so a cancelled leave (the note page's failed-save guard) or a page left for another site keeps motion on
	onNavigate(() => {
		hush();
	});
	afterNavigate(listen);
</script>

<svelte:head>{@html `<script>${RAIL_SCRIPT}</script>`}</svelte:head>
<!-- iOS Safari applies :active only once the page listens for touches: one passive, empty listener turns on the press
     states (the scale, the darkened rows, the dock's "+") -->
<svelte:document ontouchstart={() => {}} />

<!-- the fingerprint composition: one frame over the colour field, a CC0 lake photo blurred past recognition (the
     signed hi-fi's field), shipped 160 px wide since only its colours survive the blur. The sticky dock stays in the frame's
     column, so a short page still has it at the bottom edge without scrolling. -->
<div class="app" data-backdrop="field" style:--photo={'url("/backdrop.jpg")'}>
	<div class="shell">
		<SideTree />
		<main class="area">
			<div class="page">
				{@render children()}
			</div>
		</main>
		<PhoneBar />
	</div>
</div>
<CommandPalette />

<style>
	:global(:root) {
		--sidebar-w: 17.5rem;
		--rail-w: var(--rail-width);
		/* how far a page reaches to the frame's edge (the folder cover bleeds by these) */
		--gutter: var(--space-3-5);
		--area-top: calc(var(--space-3-5) + var(--space-2));
	}

	/* the I-beam promises an edit: chrome text shows the arrow, only fields and the editor keep the text cursor. And
	   chrome is not text to copy (Rue, gate 7): nothing outside the fields, the note title and the note body starts a
	   selection on a double-click or a drag. A modal dialog gets `user-select: text` from Chrome's UA sheet, so it is named
	   too; WebKit inherits -webkit-user-select, so the editable places opt back in. */
	:global(html),
	:global(dialog) {
		cursor: default;
		-webkit-user-select: none;
		user-select: none;
	}

	:global(:is(input:not([type='checkbox'], [type='radio'], [type='range'], [type='button'], [type='submit'], [type='file']), textarea, [contenteditable='true'], [contenteditable=''])) {
		cursor: text;
	}

	:global(:is(input, textarea, [contenteditable='true'], [contenteditable=''])),
	:global([contenteditable='true'] *),
	:global([contenteditable=''] *) {
		-webkit-user-select: text;
		user-select: text;
	}

	:global([contenteditable='false']) {
		cursor: default;
	}

	/* the sticky dock: a focused element scrolls clear of it (base.css scroll-padding) */
	@media (max-width: 1023px) {
		:global(:root) {
			--sticky-block-end: calc(var(--target-touch) + var(--space-6) + max(var(--space-3), env(safe-area-inset-bottom)));
		}
	}

	@media (min-width: 1024px) {
		:global(:root) {
			--gutter: calc(var(--space-3-5) + var(--space-2));
			--area-top: calc(var(--space-3-5) + var(--space-4));
		}
	}

	/* the frame: glass-white over the field, no backdrop-filter of its own (the field is already blurred, and a
	   filter here would turn every fixed descendant relative to the frame); it clips the folder cover to its corners */
	.shell {
		display: flex;
		flex-direction: column;
		max-inline-size: var(--frame-max-width);
		min-block-size: calc(100dvh - 2 * var(--space-2));
		margin-inline: auto;
		padding: var(--space-3-5) var(--space-3-5) var(--space-4);
		border-radius: var(--radius-frame-compact);
		overflow: clip;
		background: var(--surface-frame-strong);
		box-shadow: var(--elevation-frame);
	}

	.area {
		flex: 1;
		min-inline-size: 0;
		padding-block: var(--space-2) var(--space-6);
	}

	/* below the wide layout a pointer can be a finger: every control keeps a 44px box (as in the signed hi-fi) */
	@media (max-width: 1099px) {
		.shell {
			--target: var(--target-touch);
			--control-height-xs: var(--target-touch);
		}
	}

	/* the dock's tray runs out to the frame's edge, gutter to gutter as when it follows the frame (layout.css) */
	.shell > :global(.dock) {
		inline-size: min(100% + 2 * var(--space-3-5), 30rem);
		margin-inline: max(-1 * var(--space-3-5), (100% - 30rem) / 2);
	}

	.page {
		min-inline-size: 0;
	}

	@media (min-width: 768px) {
		.shell {
			min-block-size: calc(100dvh - 2 * var(--space-frame-block));
			border-radius: var(--radius-frame);
		}
	}

	@media (min-width: 1024px) {
		.shell {
			display: grid;
			grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
			align-items: start;
			column-gap: var(--space-4);
			padding: var(--space-3-5);
		}

		:global(html[data-rail]) .shell {
			grid-template-columns: var(--rail-w) minmax(0, 1fr);
		}

		.area {
			padding: var(--space-4) var(--space-2) var(--space-10) 0;
		}
	}
</style>
