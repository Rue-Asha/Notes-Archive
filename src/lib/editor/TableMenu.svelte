<script lang="ts">
	import { tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
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

	const actions: { label: string; run: (e: Editor) => void; can: (e: Editor) => boolean }[] = [
		{ label: 'Add row below', run: (e) => void e.chain().focus().addRowAfter().run(), can: (e) => e.can().addRowAfter() },
		{ label: 'Add column right', run: (e) => void e.chain().focus().addColumnAfter().run(), can: (e) => e.can().addColumnAfter() },
		{ label: 'Delete row', run: (e) => void e.chain().focus().deleteRow().run(), can: (e) => e.can().deleteRow() },
		{ label: 'Delete column', run: (e) => void e.chain().focus().deleteColumn().run(), can: (e) => e.can().deleteColumn() }
	];

	const enabled = (can: (e: Editor) => boolean) => {
		void version;
		return !!editor && can(editor);
	};
</script>

{#if table}
	<div class="bar glass strong" role="toolbar" aria-label="Table" bind:this={bar} use:portal transition:fadeSlide={{ y: 4 }} use:hideOnOutro>
		{#each actions as action (action.label)}
			<button type="button" disabled={!enabled(action.can)} onmousedown={(e) => e.preventDefault()} onclick={() => editor && action.run(editor)}>
				{action.label}
			</button>
		{/each}
	</div>
{/if}

<style>
	.bar {
		position: fixed;
		z-index: 70;
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		max-inline-size: calc(100vw - 16px);
		padding: var(--s-1);
		border-radius: var(--r-lg);
		box-shadow: var(--glass-rim), var(--shadow-float);
		font-size: var(--t-small);
	}

	button {
		min-block-size: 36px;
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink);
		font: inherit;
		white-space: nowrap;
	}

	button:hover:not(:disabled) {
		background: var(--row-hover);
	}

	button:disabled {
		color: var(--ink-2);
		opacity: 0.5;
	}
</style>
