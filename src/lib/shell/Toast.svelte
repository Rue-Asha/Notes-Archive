<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import Icon from '#lib/ui/Icon.svelte';
	import { attach, dismiss, flush, park, toasts } from './toast.ts';

	onMount(attach);
	afterNavigate(flush);
</script>

<svelte:window onpagehide={park} onpageshow={flush} />

<div class="toasts" role="status" aria-live="polite" data-surface="inverse">
	{#each $toasts as item (item.id)}
		<div class="toast" class:error={item.tone === 'error'}>
			{#if item.tone === 'error'}<span class="mark" aria-hidden="true"><Icon name="alert" size={18} /></span>{/if}
			<p class="message">{item.message}</p>
			<button type="button" class="dismiss" aria-label="Dismiss" data-press="round" onclick={() => dismiss(item.id)}>
				<Icon name="close" size={16} />
			</button>
		</div>
	{/each}
</div>

<style>
	/* one step above the sort popover, which shares --z-toast and sits later in the document */
	.toasts {
		position: fixed;
		z-index: calc(var(--z-toast) + 1);
		inset-inline: var(--space-4);
		inset-block-end: calc(var(--space-4) + env(safe-area-inset-bottom));
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		inline-size: min(100%, calc(var(--measure) * 0.75));
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-inverse);
		box-shadow: var(--elevation-menu);
		color: var(--ink-on-inverse);
		pointer-events: auto;
		animation: enter var(--motion-glide) var(--ease-out);
	}

	.mark {
		display: inline-flex;
		flex: none;
		color: var(--danger-on-inverse);
	}

	.message {
		flex: 1;
		min-inline-size: 0;
		padding-block: var(--space-2);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
	}

	.dismiss {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-xs), var(--target));
		min-block-size: max(var(--control-height-xs), var(--target));
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-on-inverse);
	}

	@media (hover: hover) {
		.dismiss:hover {
			background: var(--surface-inverse-tint-strong);
		}
	}

	/* above the bottom bar */
	@media (max-width: 1023px) {
		.toasts {
			inset-block-end: calc(80px + env(safe-area-inset-bottom) + var(--space-4));
		}
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(var(--settle-rise));
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation-name: fade;
		}
	}
</style>
