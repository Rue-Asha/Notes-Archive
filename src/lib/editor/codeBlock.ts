import type { AnyExtension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import type { EditorContext } from './context.ts';
import { LANGUAGES } from './languages.ts';

const lowlight = createLowlight(common);

export function codeBlock(ctx: EditorContext): AnyExtension {
	return CodeBlockLowlight.extend({
		addNodeView() {
			return ({ node: initial, editor, getPos }) => {
				const dom = document.createElement('pre');
				const picker = document.createElement('select');
				picker.className = 'code-language';
				picker.contentEditable = 'false';
				picker.setAttribute('aria-label', 'Language');
				picker.append(new Option('Plain text', ''), ...LANGUAGES.map((l) => new Option(l.label, l.name)));
				const code = document.createElement('code');
				code.className = 'hljs';
				dom.append(picker, code);

				const show = (language: string | null) => {
					picker.value = LANGUAGES.some((l) => l.name === language) ? language! : '';
				};
				show(initial.attrs.language);

				picker.addEventListener('change', () => {
					const pos = getPos();
					if (pos === undefined) return;
					const node = editor.state.doc.nodeAt(pos);
					if (!node) return;
					editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, language: picker.value || null }));
					editor.view.focus();
				});

				return {
					dom,
					contentDOM: code,
					update(node) {
						if (node.type !== initial.type) return false;
						show(node.attrs.language);
						return true;
					},
					stopEvent: (event) => event.target === picker,
					ignoreMutation: (mutation) => picker.contains(mutation.target)
				};
			};
		}
	}).configure({ lowlight });
}
