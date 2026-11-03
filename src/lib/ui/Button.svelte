<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowButton from './ArrowButton.svelte';

	type Props = {
		children: Snippet;
		variant?: 'cta' | 'secondary' | 'ghost' | 'danger';
		href?: string;
		// the cta ends in a round arrow button unless arrow is false
		arrow?: boolean;
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick' | 'children'>;

	let { children, variant = 'cta', href, arrow, type = 'button', disabled = false, onclick, class: cls = '', ...rest }: Props = $props();

	const withArrow = $derived(arrow ?? variant === 'cta');
</script>

{#snippet inner()}
	<span class="label">{@render children()}</span>
	{#if withArrow}<ArrowButton decorative variant="light" size="sm" />{/if}
{/snippet}

{#if href}
	<a class="btn {variant} {cls}" class:has-arrow={withArrow} {href} {...rest}>{@render inner()}</a>
{:else}
	<button class="btn {variant} {cls}" class:has-arrow={withArrow} {type} {disabled} {onclick} {...rest}>{@render inner()}</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-4);
		min-block-size: var(--control);
		padding: 0 var(--s-6);
		border: 1px solid transparent;
		border-radius: var(--r-pill);
		font-size: var(--t-body);
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		transition: transform var(--d-fast) var(--ease-out);
	}

	.has-arrow {
		padding-inline: var(--s-6) 6px;
	}

	.cta {
		background: var(--ink);
		color: var(--surface);
		min-block-size: 48px;
		box-shadow: var(--shadow-cta);
	}

	.secondary {
		background: transparent;
		border-color: var(--ink);
		color: var(--ink);
	}

	.ghost {
		background: transparent;
		color: var(--ink);
	}
	.ghost:hover:not(:disabled) {
		background: var(--row-hover);
	}

	.danger {
		background: var(--danger);
		color: var(--on-danger);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
