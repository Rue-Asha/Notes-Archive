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
	<input type="text" inputmode="url" aria-label="Link URL" placeholder="Paste or type a link" bind:value onkeydown={keys} use:focus />
	{#if href}
		<button type="button" class="remove" onclick={onremove}>Remove link</button>
	{/if}
	<button type="button" class="apply" aria-label="Apply link" disabled={!value.trim()} onclick={() => onapply(value.trim())}>
		<Icon name="check" size={17} />
	</button>
</div>

<style>
	.field {
		display: flex;
		align-items: center;
		gap: var(--s-1);
	}

	input {
		inline-size: clamp(140px, 45vw, 220px);
		block-size: 36px;
		padding: 0 var(--s-3);
		border: 0;
		background: transparent;
		color: var(--ink);
		font: inherit;
		outline: none;
	}

	button {
		display: inline-grid;
		place-items: center;
		min-inline-size: 36px;
		block-size: 36px;
		padding: 0 var(--s-2);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink);
		font: inherit;
	}

	button:hover:not(:disabled) {
		background: var(--row-hover);
	}

	button:disabled {
		opacity: 0.4;
	}

	.apply:not(:disabled) {
		color: var(--accent);
	}
</style>
