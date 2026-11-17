<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { ms } from '#lib/ui/motion.ts';

	// a confirmation as in the signed hi-fi: the title is the question, the message its consequence, the danger button
	// names what goes ("Delete note") with a trash icon, and Cancel has the focus
	type Props = {
		open: boolean;
		title: string;
		message: string;
		confirmLabel: string;
		danger?: boolean;
		onconfirm(): void;
		oncancel(): void;
	};

	let { open, title, message, confirmLabel, danger = false, onconfirm, oncancel }: Props = $props();

	// the question names the note or folder, so a closed dialog (one per card) keeps it out of the page; it stays while
	// the dialog fades out
	let asking = $state(false);
	$effect(() => {
		if (open) {
			asking = true;
			return;
		}
		const timer = setTimeout(() => (asking = false), ms('--motion-glide'));
		return () => clearTimeout(timer);
	});
</script>

<Sheet bind:open={() => open, (next) => !next && oncancel()} title={asking ? title : ''} mode="dialog" alert={danger}>
	<p class="message">{message}</p>
	{#snippet actions()}
		<Button autofocus onclick={oncancel}>Cancel</Button>
		<Button variant={danger ? 'danger' : 'primary'} onclick={onconfirm}>{#if danger}<Icon name="trash" size={16} />{/if}{confirmLabel}</Button>
	{/snippet}
</Sheet>

<style>
	.message {
		overflow-wrap: anywhere;
		hyphens: auto;
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	/* phones: the choices stack full width, Cancel first, as in the hi-fi bottom sheet */
	@media (max-width: 767px) {
		:global(dialog[data-sheet]:has(.message) footer) {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
