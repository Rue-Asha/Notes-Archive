<script lang="ts">
	import { tick } from 'svelte';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import Button from './Button.svelte';
	import { portal, trapTab } from './overlay.ts';

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

	let dialog = $state<HTMLDivElement>();
	let opener: HTMLElement | null = null;

	$effect(() => {
		if (open) {
			opener = document.activeElement as HTMLElement | null;
			tick().then(() => dialog?.querySelector('button')?.focus());
		} else if (opener) {
			opener.focus();
			opener = null;
		}
	});

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			oncancel();
		} else trapTab(event, dialog!);
	}
</script>

{#if open}
	<div class="overlay" role="presentation" use:portal transition:fadeSlide={{ y: 0 }} onpointerdown={(e) => e.target === e.currentTarget && oncancel()}>
		<div
			class="dialog glass strong"
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-message"
			tabindex="-1"
			bind:this={dialog}
			onkeydown={keys}
			transition:fadeSlide={{ y: 14 }}
			use:hideOnOutro
		>
			<h2 id="dialog-title">{title}</h2>
			<p id="dialog-message">{message}</p>
			<div class="actions">
				<Button variant="secondary" arrow={false} onclick={oncancel}>Cancel</Button>
				<Button variant={danger ? 'danger' : 'cta'} arrow={false} onclick={onconfirm}>{confirmLabel}</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		background: color-mix(in srgb, var(--ink) 28%, transparent);
	}

	.dialog {
		display: grid;
		gap: var(--s-3);
		inline-size: min(100%, 440px);
		padding: var(--s-7);
		border-radius: var(--r-xl);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	h2 {
		font-size: var(--t-display-3);
	}

	p {
		overflow-wrap: anywhere;
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--s-3);
		margin-block-start: var(--s-4);
	}
</style>
