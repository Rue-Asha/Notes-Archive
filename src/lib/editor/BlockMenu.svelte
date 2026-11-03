<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { TextSelection } from '@tiptap/pm/state';
	import Icon from '#lib/ui/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/ui/Menu.svelte';
	import { moveBlockIn, type Direction } from './blockOps.ts';

	let { touch }: { touch: boolean } = $props();

	let editor = $state.raw<Editor | null>(null);
	let target = $state.raw<() => number>(() => -1);
	let button = $state<HTMLButtonElement>();
	let menu = $state<'block' | 'turn' | null>(null);
	let index = $state(-1);
	let count = $state(0);

	export function attach(next: Editor, blockIndex: () => number) {
		editor = next;
		target = blockIndex;
	}

	// a hovered handle keeps its block while the pointer is over the menu
	function lock(on: boolean) {
		if (!editor || touch) return;
		editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', on));
	}

	function toggle() {
		if (menu) return close();
		index = target();
		if (!editor || index < 0) return;
		count = editor.state.doc.childCount;
		lock(true);
		menu = 'block';
	}

	function close() {
		menu = null;
		lock(false);
	}

	function move(direction: Direction) {
		if (!editor) return;
		moveBlockIn(editor, index, direction);
		editor.view.focus();
	}

	function start(): number {
		let pos = 0;
		for (let i = 0; i < index; i++) pos += editor!.state.doc.child(i).nodeSize;
		return pos;
	}

	function remove() {
		if (!editor) return;
		const from = start();
		editor.chain().focus().deleteRange({ from, to: from + editor.state.doc.child(index).nodeSize }).run();
	}

	function turn(run: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) {
		if (!editor) return;
		const inside = start() + 1;
		const chain = editor
			.chain()
			.focus()
			.command(({ tr }) => {
				tr.setSelection(TextSelection.near(tr.doc.resolve(inside)));
				return true;
			})
			.clearNodes();
		run(chain).run();
	}

	const turnItems = $derived.by(() => {
		const items: [string, (c: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>][] = [
			['Text', (c) => c],
			['Heading 1', (c) => c.setHeading({ level: 1 })],
			['Heading 2', (c) => c.setHeading({ level: 2 })],
			['Heading 3', (c) => c.setHeading({ level: 3 })],
			['Bullet list', (c) => c.toggleBulletList()],
			['Numbered list', (c) => c.toggleOrderedList()],
			['Task list', (c) => c.toggleTaskList()],
			['Quote', (c) => c.toggleBlockquote()],
			['Code', (c) => c.setCodeBlock()]
		];
		const callout = editor && 'setCallout' in editor.can() ? (c: ReturnType<Editor['chain']>) => (c as unknown as { setCallout(): typeof c }).setCallout() : null;
		if (callout) items.push(['Callout', callout]);
		return items.map(([label, run]): MenuItem => ({ label, onselect: () => turn(run) }));
	});

	const blockItems = $derived<MenuItem[]>([
		{ label: 'Move up', disabled: index <= 0, onselect: () => move('up') },
		{ label: 'Move down', disabled: index >= count - 1, onselect: () => move('down') },
		{ label: 'Turn into', onselect: () => (menu = 'turn') },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: remove }
	]);
</script>

<button type="button" class="handle" class:touch aria-label="Block actions" bind:this={button} onmousedown={(e) => touch && e.preventDefault()} onclick={toggle}>
	<Icon name="grip" size={18} />
</button>

<Menu open={menu === 'block'} anchor={button ?? null} label="Block menu" items={blockItems} onclose={close} />
<Menu open={menu === 'turn'} anchor={button ?? null} label="Turn into" items={turnItems} onclose={close} />

<style>
	.handle {
		display: inline-grid;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		padding: 0;
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--muted);
		cursor: grab;
	}

	.handle:hover {
		background: var(--row-hover);
		color: var(--ink);
	}

	.touch {
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--r-md);
		cursor: pointer;
	}

	:global(.ProseMirror.touch-handle) {
		padding-inline-end: 40px;
	}

	:global(.prosemirror-dropcursor-block) {
		background-color: var(--accent) !important;
	}
</style>
