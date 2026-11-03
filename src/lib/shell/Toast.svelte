<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import { attach, flush, toasts } from './toast.ts';

	onMount(attach);
	afterNavigate(flush);
</script>

<div class="toasts">
	{#each $toasts as item (item.id)}
		<p class="toast glass strong" class:error={item.tone === 'error'} role="status" transition:fadeSlide use:hideOnOutro>{item.message}</p>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		inset-inline: 0;
		inset-block-end: var(--s-7);
		z-index: 60;
		display: grid;
		justify-items: center;
		gap: var(--s-2);
		padding-inline: var(--s-4);
		pointer-events: none;
	}

	.toast {
		margin: 0;
		min-block-size: var(--control);
		display: flex;
		align-items: center;
		padding: 0 var(--s-6);
		border-radius: var(--r-pill);
		font-size: var(--t-body);
		font-weight: 500;
	}

	.strong {
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.error {
		color: var(--danger);
	}

	/* above the bottom bar */
	@media (max-width: 1023px) {
		.toasts {
			inset-block-end: calc(80px + env(safe-area-inset-bottom) + var(--s-4));
		}
	}
</style>
