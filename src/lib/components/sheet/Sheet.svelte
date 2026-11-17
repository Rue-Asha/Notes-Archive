<!--
	Sheet: copy-in reference primitive from Design-System (sync.sh <app> --primitive sheet).
	The app owns this copy; restyle it with fingerprint tokens only.
	A modal <dialog> opened with showModal(): a bottom sheet on phones and a centred dialog
	from 768px; mode="dialog" is a bottom sheet on phones and a narrower centred dialog from
	768px (confirmations). It opens with a short soft rise and closes the same way, only opacity and
	transform, a confirmation on a phone leaving at the quick speed; under reduced motion it is instant (Rue, 2026-11-16). Focus moves in (put
	autofocus on the first field, otherwise the first control gets it) and returns to the
	opener; Escape, the close button and a click on the backdrop close it; the page behind
	does not scroll. Props: open (bindable), title, kicker, label (an accessible name that
	replaces the title's), mode (sheet | dialog), alert (an alertdialog: a confirmation of something that can't be undone), closeLabel, onclose, children, actions (a
	snippet for the footer row).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { trapTab } from '#lib/ui/overlay.ts';

	type Props = {
		open?: boolean;
		title: string;
		kicker?: string;
		label?: string;
		mode?: 'sheet' | 'dialog';
		alert?: boolean;
		closeLabel?: string;
		onclose?: () => void;
		children: Snippet;
		actions?: Snippet;
	};

	const uid = $props.id();
	let { open = $bindable(false), title, kicker, label, mode = 'sheet', alert = false, closeLabel = 'Close', onclose, children, actions }: Props = $props();

	let dialog: HTMLDialogElement;
	let opener: HTMLElement | null = null;

	$effect(() => {
		if (open && !dialog.open) {
			opener = document.activeElement as HTMLElement | null;
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
			if (opener?.isConnected) opener.focus();
			opener = null;
			onclose?.();
		}
	});

	// a sheet unmounted while open still hands focus back
	$effect(() => () => {
		if (!dialog?.open) return;
		dialog.close();
		if (opener?.isConnected) opener.focus();
	});
</script>

<dialog
	bind:this={dialog}
	class={mode}
	data-sheet
	role={alert ? 'alertdialog' : undefined}
	aria-label={label}
	aria-labelledby={label ? undefined : `${uid}-title`}
	onkeydown={(e) => trapTab(e, dialog)}
	oncancel={(e) => {
		e.preventDefault();
		open = false;
	}}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
>
	<header>
		<div>
			{#if kicker}<p class="kicker">{kicker}</p>{/if}
			<h2 id="{uid}-title">{title}</h2>
		</div>
		<button type="button" class="close" aria-label={closeLabel} data-press="round" onclick={() => (open = false)}>
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
		</button>
	</header>
	<div class="body">
		{#if open}{@render children()}{/if}
	</div>
	{#if actions}<footer>{@render actions()}</footer>{/if}
</dialog>

<style>
	/* The page behind stays put while a sheet is open. */
	:global(html:has(dialog[data-sheet][open])) {
		overflow: hidden;
	}

	dialog {
		flex-direction: column;
		inline-size: 100%;
		max-inline-size: none;
		max-block-size: min(88dvh, 100% - var(--space-6));
		margin: auto 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		overflow: hidden;
	}
	dialog[open] {
		display: flex;
	}
	dialog::backdrop {
		background: var(--surface-tint-strong);
	}

	/* Phones: the sheet rises from the bottom edge it is pinned to. From 768px it is centred, so it rises a few pixels
	   and grows from 0.97 out of its own centre. The backdrop fades with it; display and overlay are held until the
	   exit has run. */
	dialog,
	dialog::backdrop {
		--sheet-from: translateY(100%);
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-glide) var(--ease-out),
			overlay var(--motion-glide) allow-discrete,
			display var(--motion-glide) allow-discrete;
	}
	dialog:not([open]) {
		opacity: 0;
		transform: var(--sheet-from);
	}
	dialog:not([open])::backdrop {
		opacity: 0;
	}
	@starting-style {
		dialog[open] {
			opacity: 0;
			transform: var(--sheet-from);
		}
		dialog[open]::backdrop {
			opacity: 0;
		}
	}
	/* a confirmation is answered, so on a phone it leaves quicker than it rose */
	@media (prefers-reduced-motion: no-preference) {
		.dialog:not([open]),
		.dialog:not([open])::backdrop {
			transition-duration: var(--motion-quick);
		}
	}
	@media (min-width: 768px) {
		dialog,
		dialog::backdrop {
			--sheet-from: translateY(var(--space-2)) scale(0.97);
			transition-duration: var(--motion-quick);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		dialog,
		dialog::backdrop {
			transition: none;
		}
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-4) var(--space-3) var(--space-5);
	}
	.kicker {
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
	@media (hover: hover) {
		.close:hover {
			background: var(--surface-sunken);
		}
	}

	.body {
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: var(--space-1) var(--space-5) var(--space-5);
	}
	.body:last-child {
		padding-block-end: calc(var(--space-5) + env(safe-area-inset-bottom));
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--sheet-footer-padding-block-start) var(--sheet-footer-padding-inline)
			calc(var(--sheet-footer-padding-block-end) + env(safe-area-inset-bottom));
		box-shadow: var(--sheet-footer-rule);
	}

	.dialog {
		inline-size: min(calc(var(--measure) * 0.75), 100% - 2 * var(--space-4));
		margin: auto;
		border-radius: var(--radius-card);
	}
	@media (max-width: 767px) {
		.dialog {
			inline-size: 100%;
			margin: auto 0 0;
			border-radius: var(--radius-card) var(--radius-card) 0 0;
		}
	}
	@media (min-width: 768px) {
		.sheet {
			inline-size: min(var(--measure), 100% - 2 * var(--space-8));
			max-block-size: min(86dvh, 100% - var(--space-16));
			margin: auto;
			border-radius: var(--radius-card);
		}
		header {
			padding: var(--space-6) var(--space-5) var(--space-3) var(--space-6);
		}
		.body {
			padding-inline: var(--space-6);
		}
		footer {
			padding-inline: var(--sheet-footer-padding-inline-wide);
		}
	}
</style>
