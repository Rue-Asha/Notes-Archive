<script lang="ts">
	import EmojiPicker from '#lib/ui/EmojiPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { icon, onchange }: { icon: string | null; onchange(icon: string | null): void } = $props();

	let open = $state(false);
	let anchor = $state<HTMLButtonElement | null>(null);
</script>

{#if icon}
	<button bind:this={anchor} type="button" class="emoji" aria-label="Change icon" aria-haspopup="dialog" aria-expanded={open} onclick={() => (open = !open)}>
		{icon}
	</button>
{:else}
	<button bind:this={anchor} type="button" class="add" aria-haspopup="dialog" aria-expanded={open} onclick={() => (open = !open)}>
		<Icon name="smile" size={18} />Add icon
	</button>
{/if}
<EmojiPicker {open} {anchor} onpick={onchange} onclose={() => (open = false)} />

<style>
	.emoji {
		padding: 0;
		border: 0;
		border-radius: var(--r-lg);
		background: transparent;
		font-size: 64px;
		line-height: 1;
	}

	.add {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-3);
		margin-inline-start: calc(-1 * var(--s-3));
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 500;
	}

	.add:hover {
		background: var(--row-hover);
		color: var(--ink);
	}
</style>
