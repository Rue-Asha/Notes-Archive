import type { Editor } from '@tiptap/core';
import type { Id } from '#lib/types.ts';

export interface EditorContext {
	noteId: Id;
	toast(message: string, tone?: 'info' | 'error'): void;
	touch: boolean;
}

export interface SlashItem {
	id: string;
	label: string;
	keywords: string[];
	icon: string;
	run(editor: Editor, range: { from: number; to: number }): void;
}
