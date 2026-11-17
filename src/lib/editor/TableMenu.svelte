<script lang="ts">
	import { tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import Icon from '#lib/ui/Icon.svelte';
	import { portal } from '#lib/ui/overlay.ts';
	import { visibleViewport, watchViewport } from './floating.ts';

	let editor = $state.raw<Editor | null>(null);
	let version = $state(0);
	let focused = $state(false);
	let bar = $state<HTMLDivElement>();

	const table = $derived.by(() => {
		void version;
		if (!editor || !focused) return null;
		const { from } = editor.state.selection;
		const at = editor.state.doc.resolve(from);
		for (let depth = at.depth; depth > 0; depth--) {
			if (at.node(depth).type.name !== 'table') continue;
			const dom = editor.view.nodeDOM(at.before(depth));
			return dom instanceof HTMLElement ? dom : null;
		}
		return null;
	});

	export function attach(next: Editor) {
		editor = next;
		focused = next.view.hasFocus();
		next.on('transaction', () => version++);
		next.on('focus', () => (focused = true));
		next.on('blur', ({ event }) => {
			if (!bar?.contains(event.relatedTarget as Node | null)) focused = false;
		});
	}

	// above the table, or pinned to the top of the viewport while the table runs past it
	function place() {
		if (!bar || !table) return;
		const rect = table.getBoundingClientRect();
		const view = visibleViewport();
		const top = Math.max(view.top + 8, rect.top - bar.offsetHeight - 6);
		const left = Math.max(view.left + 8, Math.min(rect.left, view.left + view.width - bar.offsetWidth - 8));
		bar.style.insetBlockStart = `${top}px`;
		bar.style.insetInlineStart = `${left}px`;
	}

	$effect(() => {
		if (!table) return;
		void version;
		tick().then(place);
		return watchViewport(place);
	});

	const actions: { label: string; danger?: boolean; run: (e: Editor) => void; can: (e: Editor) => boolean }[] = [
		{ label: 'Add row below', run: (e) => void e.chain().focus().addRowAfter().run(), can: (e) => e.can().addRowAfter() },
		{ label: 'Add column right', run: (e) => void e.chain().focus().addColumnAfter().run(), can: (e) => e.can().addColumnAfter() },
		{ label: 'Delete row', danger: true, run: (e) => void e.chain().focus().deleteRow().run(), can: (e) => e.can().deleteRow() },
		{ label: 'Delete column', danger: true, run: (e) => void e.chain().focus().deleteColumn().run(), can: (e) => e.can().deleteColumn() }
	];

	const enabled = (can: (e: Editor) => boolean) => {
		void version;
		return !!editor && can(editor);
	};
</script>

{#if table}
	<div class="bar" role="toolbar" aria-label="Table" bind:this={bar} use:portal>
		{#each actions as action (action.label)}
			<button type="button" class:danger={action.danger} data-press disabled={!enabled(action.can)} onmousedown={(e) => e.preventDefault()} onclick={() => editor && action.run(editor)}>
				<Icon name={action.danger ? 'trash' : 'plus'} size={14} />{action.label}
			</button>
		{/each}
	</div>
{/if}

<style>
	.bar {
		position: fixed;
		z-index: var(--z-menu);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		max-inline-size: calc(100vw - 16px);
		padding: var(--space-1);
		border-radius: var(--radius-bar-compact);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		white-space: nowrap;
	}

	button.danger {
		color: var(--danger);
	}

	button:disabled {
		color: var(--ink-secondary);
		opacity: var(--disabled-opacity);
	}

	@media (hover: hover) {
		button:hover:not(:disabled) {
			background: var(--surface-tint);
		}
	}
</style>
