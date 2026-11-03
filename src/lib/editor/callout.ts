import { Node } from '@tiptap/core';
import { mount, unmount } from 'svelte';
import EmojiPicker from '#lib/ui/EmojiPicker.svelte';

const DEFAULT_EMOJI = '💡';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		callout: {
			setCallout: () => ReturnType;
		};
	}
}

export const Callout = Node.create({
	name: 'callout',
	group: 'block',
	content: 'paragraph+',
	defining: true,
	addAttributes() {
		return {
			emoji: {
				default: DEFAULT_EMOJI,
				parseHTML: (el) => el.dataset.emoji || DEFAULT_EMOJI,
				renderHTML: (attrs) => ({ 'data-emoji': attrs.emoji })
			}
		};
	},
	parseHTML() {
		return [{ tag: 'div.callout' }];
	},
	renderHTML({ HTMLAttributes }) {
		return ['div', { ...HTMLAttributes, class: 'callout' }, 0];
	},
	addCommands() {
		return {
			setCallout:
				() =>
				({ commands }) =>
					commands.wrapIn(this.name)
		};
	},
	addNodeView() {
		return ({ node: initial, editor, getPos }) => {
			const dom = document.createElement('div');
			dom.className = 'callout';
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'callout-emoji';
			button.contentEditable = 'false';
			button.setAttribute('aria-label', 'Change emoji');
			const content = document.createElement('div');
			dom.append(button, content);
			button.textContent = initial.attrs.emoji;

			let picker: ReturnType<typeof mount> | null = null;
			const close = () => {
				if (!picker) return;
				const open = picker;
				picker = null;
				unmount(open, { outro: true });
			};
			const pick = (emoji: string | null) => {
				const pos = getPos();
				if (pos === undefined) return;
				const node = editor.state.doc.nodeAt(pos);
				if (!node) return;
				editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, emoji: emoji ?? DEFAULT_EMOJI }));
			};
			button.addEventListener('click', () => {
				if (picker) return close();
				picker = mount(EmojiPicker, { target: document.body, props: { open: true, anchor: button, onpick: pick, onclose: close } });
			});

			return {
				dom,
				contentDOM: content,
				update(node) {
					if (node.type !== initial.type) return false;
					button.textContent = node.attrs.emoji;
					return true;
				},
				stopEvent: (event) => event.target === button,
				ignoreMutation: (mutation) => button.contains(mutation.target),
				destroy: close
			};
		};
	}
});
