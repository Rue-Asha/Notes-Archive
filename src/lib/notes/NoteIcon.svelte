<script lang="ts">
	import EmojiPicker from '#lib/ui/EmojiPicker.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { icon, onchange }: { icon: string | null; onchange(icon: string | null): void } = $props();

	let open = $state(false);
	let anchor = $state<HTMLButtonElement | null>(null);
</script>

<!-- the note's icon is the first stop of the properties bar -->
<button
	bind:this={anchor}
	type="button"
	class="icon"
	class:none={!icon}
	aria-label={icon ? 'Change icon' : 'Add icon'}
	title={icon ? 'Change icon' : 'Add icon'}
	aria-haspopup="dialog"
	aria-expanded={open}
	data-press="round"
	onclick={() => (open = !open)}
>
	{#if icon}<span class="emoji">{icon}</span>{:else}<Icon name="plus" size={18} />{/if}
</button>
<EmojiPicker {open} {anchor} onpick={onchange} onclose={() => (open = false)} />

<style>
	.icon {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--seg-height);
		block-size: var(--seg-height);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
		font-size: var(--type-title-size);
		line-height: 1;
	}

	.icon.none {
		background: var(--surface-control-solid);
		box-shadow: none;
		color: var(--ink-secondary);
	}

	@media (hover: hover) {
		.icon:hover {
			background: var(--surface-control-solid-hover);
		}
	}
</style>
