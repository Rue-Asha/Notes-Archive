<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { beforeNavigate, goto, pushState } from '$app/navigation';
	import { portal, trapTab } from './overlay.ts';

	type Side = 'left' | 'bottom' | 'full';
	type Props = { open: boolean; side: Side; label: string; onclose(): void; children: Snippet };

	let { open, side, label, onclose, children }: Props = $props();

	let sheet = $state<HTMLDivElement>();
	let opener: HTMLElement | null = null;
	// an open sheet owns one history entry, so the phone's back gesture closes it instead of leaving the page
	let pushed = false;
	let followed = false;

	// the page behind stays where it was: locked while the sheet is open (the style rule below), and put back on close
	// in case a focus or the history entry moved it
	let scrollY = 0;
	// a sheet that mounts closed (the palette mounts it when the viewport turns phone-sized) has nothing to put back
	let shown = false;

	$effect(() => {
		if (open) {
			shown = true;
			opener = document.activeElement as HTMLElement | null;
			scrollY = window.scrollY;
			pushed = true;
			pushState('', {});
			tick().then(() => {
				const first = sheet?.querySelector<HTMLElement>('[autofocus], a[href], button, input') ?? sheet;
				first?.focus({ preventScroll: true });
				if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
			});
		} else if (shown) {
			shown = false;
			// closed without a popstate: a followed link closes the sheet first and navigates in the same click
			if (pushed) {
				followed = true;
				// Kit starts the navigation a little after the click, once it has resolved the route
				setTimeout(() => (followed = false), 1000);
			}
			pushed = false;
			opener?.focus({ preventScroll: true });
			opener = null;
			if (!followed && window.scrollY !== scrollY) window.scrollTo(0, scrollY);
		}
	});

	// a link followed from the sheet takes over the sheet's own history entry, so back doesn't land on the same page twice
	let replacing = false;
	beforeNavigate((navigation) => {
		if (!followed || replacing || !navigation.to || navigation.type === 'popstate' || navigation.willUnload) return;
		navigation.cancel();
		followed = false;
		replacing = true;
		void goto(navigation.to.url, { replaceState: true }).finally(() => (replacing = false));
	});

	// Escape and the scrim go back through history; the popstate that follows closes the sheet
	function dismiss() {
		if (pushed) history.back();
		else onclose();
	}

	function popped() {
		if (!open || !pushed) return;
		pushed = false;
		onclose();
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			dismiss();
		} else trapTab(event, sheet!);
	}
</script>

<svelte:window onpopstate={popped} />

{#if open}
	<div class="layer" data-sheet-layer use:portal>
		<div class="scrim" role="presentation" onpointerdown={dismiss}></div>
		<div class="sheet {side}" role="dialog" aria-modal="true" aria-label={label} tabindex="-1" bind:this={sheet} onkeydown={keys}>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	:global(html:has([data-sheet-layer])) {
		overflow: hidden;
	}

	.layer {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: var(--surface-tint-strong);
	}

	.sheet {
		position: absolute;
		display: flex;
		flex-direction: column;
		overflow: auto;
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
	}

	.left {
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: min(86vw, 340px);
		padding-block-start: env(safe-area-inset-top);
		border-start-end-radius: var(--radius-card);
		border-end-end-radius: var(--radius-card);
	}

	.bottom {
		inset-inline: 0;
		inset-block-end: 0;
		max-block-size: 85dvh;
		padding-block-end: env(safe-area-inset-bottom);
		border-start-start-radius: var(--radius-card);
		border-start-end-radius: var(--radius-card);
	}

	.full {
		inset: 0;
		padding-block: env(safe-area-inset-top) env(safe-area-inset-bottom);
	}
</style>
