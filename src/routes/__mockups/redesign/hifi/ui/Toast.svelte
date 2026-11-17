<script lang="ts">
	import Icon from '../search/Icon.svelte';

	type Props = { message: string; kind?: 'info' | 'error'; action?: string; back?: 1 | 2; focus?: 'action' | 'dismiss' };
	let { message, kind = 'info', action, back, focus }: Props = $props();
</script>

<div class="toast" class:long={message.length > 48} class:back1={back === 1} class:back2={back === 2} data-surface="inverse" aria-hidden={back ? 'true' : undefined}>
	{#if kind === 'error'}<span class="mark"><Icon name="alert" size={18} /></span>{/if}
	<span class="message">{message}</span>
	{#if action}<button type="button" class="action" class:focus={focus === 'action'} data-press>{action}</button>{/if}
	{#if !back}<button type="button" class="dismiss" class:focus={focus === 'dismiss'} aria-label="Dismiss" data-press="round"><Icon name="close" /></button>{/if}
</div>

<style>
	.toast {
		grid-area: stack;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		inline-size: min(100%, calc(var(--measure) * 0.75));
		justify-self: center;
		min-block-size: max(var(--control-height), var(--target));
		min-inline-size: 0;
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-inverse);
		box-shadow: var(--elevation-menu);
		color: var(--ink-on-inverse);
	}
	.mark {
		display: inline-flex;
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
	/* a long message keeps the full width; its action and Dismiss move to a row of their own */
	.long {
		flex-wrap: wrap;
		row-gap: 0;
	}
	.long .message {
		flex-basis: calc(100% - var(--space-8));
	}
	.long .action {
		margin-inline-start: auto;
	}
	.long:not(:has(.action)) .dismiss {
		margin-inline-start: auto;
	}
	.action,
	.dismiss {
		display: grid;
		place-items: center;
		flex: none;
		min-block-size: max(var(--control-height-xs), var(--target));
		border: 0;
		border-radius: var(--radius-control);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	.action {
		padding-inline: var(--space-3-5);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.dismiss {
		inline-size: max(var(--control-height-xs), var(--target));
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-on-inverse);
	}
	.focus {
		outline: var(--focus-width) solid var(--focus-ring-on-inverse);
		outline-offset: var(--focus-offset);
	}
	.toast:not(.back1):not(.back2) {
		position: relative;
		z-index: var(--z-raised);
	}
	/* older toasts peek behind the front one */
	.back1,
	.back2 {
		align-self: stretch;
		transform-origin: 50% 0;
		scale: var(--toast-stack-scale);
		background: var(--surface-inverse-raised);
	}
	.back1 {
		translate: 0 calc(-1 * var(--space-2));
	}
	.back2 {
		translate: 0 calc(-2 * var(--space-2));
	}
	.back1 > *,
	.back2 > * {
		visibility: hidden;
	}
	@media (hover: hover) {
		.dismiss:hover {
			background: var(--surface-inverse-tint-strong);
		}
	}
</style>
