import { Extension, type AnyExtension } from '@tiptap/core';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { TableKit, TableView } from '@tiptap/extension-table';
import { mount, unmount } from 'svelte';
import { Callout } from './callout.ts';
import type { EditorContext, SlashItem } from './context.ts';
import TableMenu from './TableMenu.svelte';

// the stock wrapper is .tableWrapper; prose.css scrolls .table-scroll
class ScrollView extends TableView {
	constructor(...args: ConstructorParameters<typeof TableView>) {
		super(...args);
		this.dom.className = 'table-scroll';
	}
}

export function blockExtensions(ctx: EditorContext): AnyExtension[] {
	const host = document.createElement('div');
	document.body.append(host);
	const menu = mount(TableMenu, { target: host });

	return [
		Details.configure({ persist: false }),
		DetailsSummary,
		DetailsContent,
		Callout,
		// the cell minimum (96 broke words mid-word on phone) matches prose.css, so a wide table keeps its width and the wrapper scrolls
		TableKit.configure({ table: { resizable: false, cellMinWidth: 128, View: ScrollView } }),
		Extension.create({
			name: 'tableMenu',
			onCreate() {
				menu.attach(this.editor);
			},
			onDestroy() {
				unmount(menu);
				host.remove();
			}
		})
	];
}

export const blockSlashItems: SlashItem[] = [
	{
		id: 'toggle',
		label: 'Toggle',
		keywords: ['details', 'collapse', 'collapsible', 'expand'],
		icon: '▸',
		run: (editor, range) => void editor.chain().focus().deleteRange(range).setDetails().run()
	},
	{
		id: 'callout',
		label: 'Callout',
		keywords: ['note', 'info', 'hint', 'panel'],
		icon: '💡',
		run: (editor, range) => void editor.chain().focus().deleteRange(range).setCallout().run()
	},
	{
		id: 'table',
		label: 'Table',
		keywords: ['grid', 'rows', 'columns'],
		icon: '▦',
		run: (editor, range) => void editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
	}
];
