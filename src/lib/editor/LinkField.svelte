<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '#lib/ui/Icon.svelte';

	type Props = { href: string; onapply(href: string): void; onremove(): void; oncancel(): void };

	let { href, onapply, onremove, oncancel }: Props = $props();

	let value = $state(untrack(() => href));

	const focus = (node: HTMLInputElement) => {
		node.focus();
		node.select();
	};

	function keys(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (value.trim()) onapply(value.trim());
			else onremove();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			oncancel();
		}
	}
</script>

<div class="field">
	<label class="input">
		<Icon name="link" size={16} />
		<input type="text" inputmode="url" aria-label="Link URL" placeholder="Paste or type a link" bind:value onkeydown={keys} use:focus />
	</label>
	<span class="actions">
		{#if href}
			<button type="button" class="remove" data-press onclick={onremove}>Remove link</button>
		{/if}
		<button type="button" class="apply" data-press disabled={!value.trim()} onclick={() => onapply(value.trim())}>
			Apply link
			<span class="circle" aria-hidden="true"><Icon name="arrow-right" size={14} /></span>
		</button>
	</span>
</div>

<style>
	.field {
		display: grid;
		gap: var(--space-1);
		inline-size: min(22rem, calc(100vw - 32px));
		padding: var(--space-0-5);
	}

	.input {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-inline: var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-secondary);
	}

	.input:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
	}

	input {
		flex: 1;
		min-inline-size: 0;
		min-block-size: max(var(--control-height-s), var(--target));
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-body-s-size);
		outline: none;
	}

	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-1);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2-5);
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.apply {
		padding-inline: var(--space-4) var(--space-1);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.apply:focus-visible {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}

	.apply:disabled {
		opacity: var(--disabled-opacity);
	}

	.circle {
		display: grid;
		place-items: center;
		inline-size: calc(max(var(--control-height-s), var(--target)) - var(--space-2));
		block-size: calc(max(var(--control-height-s), var(--target)) - var(--space-2));
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}

	@media (hover: hover) {
		.remove:hover {
			background: var(--surface-tint);
		}

		.apply:not(:disabled):hover {
			background: var(--surface-inverse-hover);
		}
	}
</style>
