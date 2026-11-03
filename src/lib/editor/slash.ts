import { Extension, type AnyExtension, type Editor } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { mount, unmount } from 'svelte';
import { fold } from '#lib/text.ts';
import { blockSlashItems } from './blocks.ts';
import type { EditorContext, SlashItem } from './context.ts';
import { mediaSlashItems } from './media.ts';
import SlashMenu from './SlashMenu.svelte';

type Range = { from: number; to: number };

const block = (id: string, label: string, keywords: string[], icon: string, run: (editor: Editor) => void): SlashItem => ({
	id,
	label,
	keywords,
	icon,
	run: (editor, range) => {
		editor.chain().focus().deleteRange(range).run();
		run(editor);
	}
});

const heading = (level: 1 | 2 | 3) =>
	block(`heading-${level}`, `Heading ${level}`, ['title', 'h' + level, 'headline'], `H${level}`, (e) =>
		void e.chain().focus().setHeading({ level }).run()
	);

export const coreSlashItems: SlashItem[] = [
	block('text', 'Text', ['paragraph', 'plain'], 'T', (e) => void e.chain().focus().setParagraph().run()),
	heading(1),
	heading(2),
	heading(3),
	block('bullet-list', 'Bullet list', ['unordered', 'ul'], '•', (e) => void e.chain().focus().toggleBulletList().run()),
	block('ordered-list', 'Numbered list', ['ordered', 'ol'], '1.', (e) => void e.chain().focus().toggleOrderedList().run()),
	block('task-list', 'Task list', ['todo', 'checkbox', 'checklist'], '✓', (e) => void e.chain().focus().toggleTaskList().run()),
	block('quote', 'Quote', ['blockquote', 'citation'], '“', (e) => void e.chain().focus().toggleBlockquote().run()),
	block('code', 'Code', ['codeblock', 'snippet'], '</>', (e) => void e.chain().focus().setCodeBlock().run()),
	block('divider', 'Divider', ['rule', 'line', 'hr', 'separator'], '—', (e) => void e.chain().focus().setHorizontalRule().run())
];

export function filterSlash(items: SlashItem[], query: string): SlashItem[] {
	const q = fold(query);
	if (!q) return items;
	return items.filter((item) => [item.label, ...item.keywords].some((text) => fold(text).includes(q)));
}

export function slashExtensions(ctx: EditorContext): AnyExtension[] {
	const host = document.createElement('div');
	document.body.append(host);
	const menu = mount(SlashMenu, { target: host });

	return [
		Extension.create({
			name: 'slashMenu',
			addProseMirrorPlugins() {
				return [
					Suggestion<SlashItem, SlashItem>({
						editor: this.editor,
						char: '/',
						allowSpaces: false,
						allow: ({ state, range }) => !state.doc.resolve(range.from).parent.type.spec.code,
						items: ({ query }) => filterSlash([...coreSlashItems, ...blockSlashItems, ...mediaSlashItems], query),
						command: ({ editor, range, props }) => props.run(editor, range as Range),
						render: () => ({
							onStart: (props) => menu.show(props),
							onUpdate: (props) => menu.update(props),
							onKeyDown: ({ event }) => menu.key(event),
							onExit: () => menu.hide()
						})
					})
				];
			},
			onDestroy() {
				unmount(menu);
				host.remove();
			}
		})
	];
}
