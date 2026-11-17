<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../search/Icon.svelte';

	type Props = {
		id: string;
		title: string;
		kicker?: string;
		body?: string;
		alert?: boolean;
		wide?: boolean;
		children?: Snippet;
		actions?: Snippet;
	};
	let { id, title, kicker, body, alert = false, wide = false, children, actions }: Props = $props();
</script>

<div class="dialog" class:wide role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby="{id}-t" aria-describedby={body ? `${id}-b` : undefined}>
	<header>
		<div class="head">
			{#if kicker}<p class="kick">{kicker}</p>{/if}
			<h2 id="{id}-t">{title}</h2>
		</div>
		<button type="button" class="close" aria-label="Close" data-press="round"><Icon name="close" /></button>
	</header>
	{#if body || children}
		<div class="content">
			{#if body}<p class="lede" id="{id}-b">{body}</p>{/if}
			{#if children}{@render children()}{/if}
		</div>
	{/if}
	{#if actions}<footer>{@render actions()}</footer>{/if}
</div>

<style>
	.dialog {
		display: flex;
		flex-direction: column;
		inline-size: min(100%, calc(var(--measure) * 0.75));
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		overflow: hidden;
		min-inline-size: 0;
	}
	.dialog.wide {
		inline-size: min(100%, var(--measure));
	}
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-6) var(--space-4) var(--space-3) var(--space-6);
	}
	.head {
		min-inline-size: 0;
	}
	.kick {
		margin-block-end: var(--space-1);
		font-size: var(--type-kicker-size);
		line-height: var(--type-kicker-line);
		letter-spacing: var(--type-kicker-tracking);
		font-weight: var(--type-kicker-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		margin-block-start: calc(-1 * var(--space-1));
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
	}
	.content {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-1) var(--space-6) var(--space-6);
		min-inline-size: 0;
	}
	.content:last-child {
		padding-block-end: var(--space-6);
	}
	.lede {
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--sheet-footer-padding-block-start) var(--sheet-footer-padding-inline-wide) var(--sheet-footer-padding-block-end);
		box-shadow: var(--sheet-footer-rule);
	}
	/* phones: a dialog is a bottom sheet */
	@media (max-width: 767px) {
		.dialog,
		.dialog.wide {
			inline-size: 100%;
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}
		header {
			padding: var(--space-5) var(--space-4) var(--space-3) var(--space-5);
		}
		.content {
			padding-inline: var(--space-5);
		}
		footer {
			padding-inline: var(--sheet-footer-padding-inline);
		}
		footer :global(.btn) {
			flex: 1 1 8rem;
		}
	}
</style>
