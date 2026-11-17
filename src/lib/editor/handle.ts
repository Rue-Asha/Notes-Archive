import { Extension, type AnyExtension, type Editor } from '@tiptap/core';
import { DragHandle } from '@tiptap/extension-drag-handle';
import { NodeSelection, Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { mount, unmount } from 'svelte';
import BlockMenu from './BlockMenu.svelte';
import type { EditorContext } from './context.ts';
import { watchViewport } from './floating.ts';

export function handleExtensions(ctx: EditorContext): AnyExtension[] {
	const host = document.createElement('div');
	host.style.visibility = 'hidden';
	const handle = mount(BlockMenu, { target: host, props: { touch: ctx.touch } });

	// the handle sits left of its block, so the block is whatever lies under the handle's own top edge
	const hoveredBlock = (editor: Editor) => {
		const grip = host.getBoundingClientRect();
		const edge = editor.view.dom.getBoundingClientRect();
		const hit = editor.view.posAtCoords({ left: edge.left + 2, top: grip.top + 4 });
		return hit ? editor.state.doc.resolve(hit.inside >= 0 ? hit.inside : hit.pos).index(0) : -1;
	};
	const cursorBlock = (editor: Editor) => editor.state.selection.$from.index(0);

	const wiring = Extension.create({
		name: 'blockHandle',
		onCreate() {
			handle.attach(this.editor, () => (ctx.touch ? cursorBlock(this.editor) : hoveredBlock(this.editor)));
		},
		onDestroy() {
			unmount(handle);
			host.remove();
		}
	});

	if (!ctx.touch) {
		return [
			DragHandle.configure({
				render: () => host
			}),
			wiring
		];
	}

	// Touch has no hover and no drag: the handle sits at the block the cursor is in and opens the block menu
	host.style.position = 'fixed';
	host.style.zIndex = '60';
	document.body.append(host);
	return [
		wiring,
		Extension.create({
			name: 'touchBlockHandle',
			addProseMirrorPlugins() {
				return [
					new Plugin({
						// the strip belongs to the cursor's block only, so every other paragraph keeps the card's full width
						props: {
							decorations: ({ doc, selection }) => {
								const { $from } = selection;
								if ($from.depth < 1) return null;
								const at = $from.before(1);
								return DecorationSet.create(doc, [Decoration.node(at, at + doc.child($from.index(0)).nodeSize, { class: 'has-handle' })]);
							}
						},
						view: (view) => {
							const refresh = () => {
								const { selection } = view.state;
								const { $from } = selection;
								// a tapped image, file card or divider is a node selection at the top level, so $from sits in the doc itself
								const at = $from.depth >= 1 ? $from.before(1) : selection instanceof NodeSelection ? selection.from : -1;
								const dom = at >= 0 && view.hasFocus() ? view.nodeDOM(at) : null;
								if (!(dom instanceof HTMLElement)) {
									host.style.visibility = 'hidden';
									return;
								}
								const rect = dom.getBoundingClientRect();
								host.style.insetBlockStart = `${rect.top}px`;
								host.style.insetInlineStart = `${view.dom.getBoundingClientRect().right - 38}px`;
								host.style.visibility = 'visible';
							};
							view.dom.classList.add('touch-handle');
							const stop = watchViewport(refresh);
							view.dom.addEventListener('focus', refresh);
							view.dom.addEventListener('blur', refresh);
							return {
								update: refresh,
								destroy() {
									stop();
									view.dom.classList.remove('touch-handle');
									view.dom.removeEventListener('focus', refresh);
									view.dom.removeEventListener('blur', refresh);
								}
							};
						}
					})
				];
			}
		})
	];
}
