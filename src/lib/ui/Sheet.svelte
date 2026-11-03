<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import type { TransitionConfig } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate, goto, pushState } from '$app/navigation';
	import { fadeSlide, hideOnOutro, reducedMotion } from '#lib/motion.ts';
	import { portal, trapTab } from './overlay.ts';

	type Side = 'left' | 'bottom' | 'full';
	type Props = { open: boolean; side: Side; label: string; onclose(): void; children: Snippet };

	let { open, side, label, onclose, children }: Props = $props();

	let sheet = $state<HTMLDivElement>();
	let opener: HTMLElement | null = null;
	// an open sheet owns one history entry, so the phone's back gesture closes it instead of leaving the page
	let pushed = false;
	let followed = false;

	$effect(() => {
		if (open) {
			opener = document.activeElement as HTMLElement | null;
			pushed = true;
			pushState('', {});
			tick().then(() => sheet?.querySelector<HTMLElement>('[autofocus], a[href], button, input')?.focus() ?? sheet?.focus());
		} else {
			// closed without a popstate: a followed link closes the sheet first and navigates in the same click
			if (pushed) {
				followed = true;
				// Kit starts the navigation a little after the click, once it has resolved the route
				setTimeout(() => (followed = false), 1000);
			}
			pushed = false;
			opener?.focus();
			opener = null;
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

	function slide(_node: Element): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		return {
			duration: 280,
			easing: cubicOut,
			css: (t, u) => {
				if (side === 'left') return `transform: translateX(${(-u * 100).toFixed(2)}%)`;
				if (side === 'bottom') return `transform: translateY(${(u * 100).toFixed(2)}%)`;
				return `transform: translateY(${(u * 24).toFixed(2)}px); opacity: ${t}`;
			}
		};
	}
</script>

<svelte:window onpopstate={popped} />

{#if open}
	<div class="layer" use:portal>
		<div class="scrim" role="presentation" transition:fadeSlide={{ y: 0 }} onpointerdown={dismiss}></div>
		<div class="sheet glass strong {side}" role="dialog" aria-modal="true" aria-label={label} tabindex="-1" bind:this={sheet} onkeydown={keys} transition:slide use:hideOnOutro>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.layer {
		position: fixed;
		inset: 0;
		z-index: 80;
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--ink) 28%, transparent);
	}

	.sheet {
		position: absolute;
		display: flex;
		flex-direction: column;
		overflow: auto;
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.left {
		inset-block: 0;
		inset-inline-start: 0;
		inline-size: min(86vw, 340px);
		padding-block-start: env(safe-area-inset-top);
		border-start-end-radius: var(--r-xl);
		border-end-end-radius: var(--r-xl);
	}

	.bottom {
		inset-inline: 0;
		inset-block-end: 0;
		max-block-size: 85dvh;
		padding-block-end: env(safe-area-inset-bottom);
		border-start-start-radius: var(--r-xl);
		border-start-end-radius: var(--r-xl);
	}

	.full {
		inset: 0;
		padding-block: env(safe-area-inset-top) env(safe-area-inset-bottom);
	}
</style>
