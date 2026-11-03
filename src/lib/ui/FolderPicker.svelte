<script lang="ts">
	import { tick } from 'svelte';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import type { Id, Tree } from '#lib/types.ts';
	import Button from './Button.svelte';
	import { pickable } from './folderPicker.ts';
	import Icon from './Icon.svelte';
	import { portal, trapTab } from './overlay.ts';

	type Props = { open: boolean; tree: Tree; current: Id | null; exclude?: Id; onpick(folderId: Id | null): void; oncancel(): void };

	let { open, tree, current, exclude, onpick, oncancel }: Props = $props();

	let dialog = $state<HTMLDivElement>();
	let opener: HTMLElement | null = null;

	const rows = $derived(pickable(tree, exclude));

	$effect(() => {
		if (open) {
			opener = document.activeElement as HTMLElement | null;
			tick().then(() => (dialog?.querySelector<HTMLElement>('[aria-selected="true"]') ?? dialog?.querySelector<HTMLElement>('[role="option"]'))?.focus());
		} else if (opener) {
			opener.focus();
			opener = null;
		}
	});

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			oncancel();
			return;
		}
		const options = [...dialog!.querySelectorAll<HTMLElement>('[role="option"]')];
		const at = options.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: options.length - 1 };
		if (at >= 0 && event.key in moves) {
			event.preventDefault();
			options[(moves[event.key] + options.length) % options.length].focus();
		} else trapTab(event, dialog!);
	}
</script>

{#if open}
	<div class="overlay" role="presentation" use:portal transition:fadeSlide={{ y: 0 }} onpointerdown={(e) => e.target === e.currentTarget && oncancel()}>
		<div class="picker glass strong" role="dialog" aria-modal="true" aria-label="Choose a folder" tabindex="-1" bind:this={dialog} onkeydown={keys} transition:fadeSlide={{ y: 14 }} use:hideOnOutro>
			<h2>Move to</h2>
			<div class="list" role="listbox" aria-label="Folders">
				{#each rows as row (row.id)}
					<button
						type="button"
						role="option"
						class="row"
						aria-selected={row.id === current}
						tabindex="-1"
						style:padding-inline-start="{12 + Math.min(row.depth, 6) * 16}px"
						onclick={() => onpick(row.id)}
					>
						<Icon name={row.id === null ? 'home' : 'folder'} size={18} />
						<span class="name">{row.name}</span>
						{#if row.id === current}<Icon name="check" size={16} />{/if}
					</button>
				{/each}
			</div>
			<div class="actions">
				<Button variant="secondary" arrow={false} onclick={oncancel}>Cancel</Button>
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

	.picker {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		gap: var(--s-3);
		inline-size: min(100%, 420px);
		max-block-size: min(80dvh, 560px);
		padding: var(--s-6);
		border-radius: var(--r-xl);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	h2 {
		font-size: var(--t-display-3);
	}

	.list {
		display: grid;
		align-content: start;
		overflow: auto;
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 40px;
		padding-inline-end: var(--s-3);
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink-2);
		font-size: var(--t-body);
		text-align: start;
	}

	.row:hover,
	.row:focus-visible {
		background: var(--row-hover);
	}

	.row[aria-selected='true'] {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
		color: var(--ink);
		font-weight: 600;
	}

	.name {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	@media (max-width: 1023px) {
		.overlay {
			place-items: end center;
			padding: 0;
		}

		.picker {
			inline-size: 100%;
			padding-block-end: calc(var(--s-6) + env(safe-area-inset-bottom));
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}
	}
</style>
