import { Extension, isTextSelection, type AnyExtension } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { AllSelection } from '@tiptap/pm/state';
import { mount, unmount } from 'svelte';
import BubbleToolbar from './BubbleToolbar.svelte';
import type { EditorContext } from './context.ts';

export function bubbleExtensions(ctx: EditorContext): AnyExtension[] {
	const host = document.createElement('div');
	// the plugin measures before it sets these, and a block-wide host would be centred off to the left
	Object.assign(host.style, { position: 'fixed', width: 'max-content', zIndex: '70' });
	const toolbar = mount(BubbleToolbar, { target: host });

	return [
		BubbleMenu.configure({
			element: host,
			updateDelay: 0,
			appendTo: () => document.body,
			shouldShow: ({ editor, element, view, state }) => {
				const { selection } = state;
				// Mod-a is an AllSelection, and formatting a whole note is a fair thing to do
				if (selection.empty || !(isTextSelection(selection) || selection instanceof AllSelection) || editor.isActive('codeBlock')) return false;
				return view.hasFocus() || element.contains(document.activeElement);
			},
			options: {
				strategy: 'fixed',
				placement: ctx.touch ? 'bottom' : 'top',
				offset: 8,
				// below the selection even when the keyboard leaves no room: above would cover the line being edited
				flip: !ctx.touch,
				shift: { padding: 8 },
				onShow: () => toolbar.show(),
				onHide: () => toolbar.hide()
			}
		}),
		Extension.create({
			name: 'bubbleToolbar',
			onCreate() {
				toolbar.attach(this.editor);
			},
			addKeyboardShortcuts() {
				return {
					'Mod-k': ({ editor }) => {
						const { selection } = editor.state;
						if (selection.empty || editor.isActive('codeBlock')) return false;
						toolbar.link();
						return true;
					}
				};
			},
			onDestroy() {
				unmount(toolbar);
				host.remove();
			}
		})
	];
}
