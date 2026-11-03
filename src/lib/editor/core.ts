import { Extension, type AnyExtension } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { TextColor as TextColorName } from '#lib/types.ts';
import { codeBlock } from './codeBlock.ts';
import type { EditorContext } from './context.ts';

export const TEXT_COLORS: readonly TextColorName[] = ['stone', 'clay', 'ochre', 'moss', 'sea', 'plum'];

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		textColor: {
			setTextColor: (color: TextColorName) => ReturnType;
			unsetTextColor: () => ReturnType;
		};
	}
}

const isTextColor = (value: unknown): value is TextColorName => TEXT_COLORS.includes(value as TextColorName);

// stored by token name, never by value: CSS maps data-color to --text-<name>
export const TextColor = Extension.create({
	name: 'textColor',
	addGlobalAttributes() {
		return [
			{
				types: ['textStyle'],
				attributes: {
					color: {
						default: null,
						parseHTML: (el) => (isTextColor(el.dataset.color) ? el.dataset.color : null),
						renderHTML: (attrs) => (isTextColor(attrs.color) ? { 'data-color': attrs.color } : {})
					}
				}
			}
		];
	},
	addCommands() {
		return {
			setTextColor:
				(color) =>
				({ chain }) =>
					chain().setMark('textStyle', { color }).run(),
			unsetTextColor:
				() =>
				({ chain }) =>
					chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
		};
	}
});

// TextStyle only parses spans with a style attribute; ours carry data-color instead
const ColorSpan = TextStyle.extend({
	parseHTML() {
		return [...(this.parent?.() ?? []), { tag: 'span[data-color]', consuming: false }];
	}
});

export function coreExtensions(ctx: EditorContext): AnyExtension[] {
	return [
		// the stock code mark excludes every other mark, so Mod-b, Mod-i, Mod-e on one word would leave only code
		StarterKit.configure({ codeBlock: false, code: false, link: { openOnClick: false, autolink: true } }),
		Code.extend({ excludes: '' }),
		codeBlock(ctx),
		TaskList,
		TaskItem.configure({ nested: true }),
		Placeholder.configure({ placeholder: 'Write, or type / for blocks' }),
		ColorSpan,
		TextColor
	];
}
