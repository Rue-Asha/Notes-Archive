<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		heading?: string;
		label?: string;
		children?: Snippet;
		actions?: Snippet;
		wide?: boolean;
	};
	let { title, heading, label, children, actions, wide = false }: Props = $props();
</script>

<div class="dialog" class:wide role="dialog" aria-modal="true" aria-label={label ?? title ?? heading}>
	{#if title}<h2 class="title">{title}</h2>{/if}
	{#if heading}<p class="heading">{heading}</p>{/if}
	{#if children}<div class="content">{@render children()}</div>{/if}
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	.dialog {
		display: grid;
		gap: var(--space-4);
		inline-size: min(100%, 26rem);
		padding: var(--space-6);
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		min-inline-size: 0;
	}
	.dialog.wide { inline-size: min(100%, 32rem); }
	.title {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
	}
	.heading {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.content { min-inline-size: 0; }
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-block-start: var(--space-1);
	}
	.actions :global(.btn) {
		min-block-size: var(--target-touch);
		padding-inline: var(--space-6);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-tint);
		font-weight: var(--weight-medium);
	}
	.actions :global(.btn.primary) { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.actions :global(.btn.danger) { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.actions :global(.btn:disabled) { opacity: var(--disabled-opacity); }
	@media (max-width: 767px) {
		.dialog {
			inline-size: 100%;
			padding: var(--space-5) var(--space-4);
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}
		.actions :global(.btn) { flex: 1 1 8rem; }
	}
</style>
