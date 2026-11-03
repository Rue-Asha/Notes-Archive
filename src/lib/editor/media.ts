import { Extension, type AnyExtension, type Editor } from '@tiptap/core';
import FileHandler from '@tiptap/extension-file-handler';
import type { EditorContext, SlashItem } from './context.ts';
import { FileCard } from './fileCard.ts';
import { Image } from './image.ts';
import { chooseFile, insertFile, insertFiles, insertImage, uploadPlaceholders } from './upload.ts';

export function mediaExtensions(ctx: EditorContext): AnyExtension[] {
	return [
		Image,
		FileCard,
		Extension.create({
			name: 'media',
			addStorage: () => ({ ctx }),
			addProseMirrorPlugins: () => [uploadPlaceholders()]
		}),
		FileHandler.configure({
			onPaste: (editor, files) => void insertFiles(editor, ctx, files, editor.state.selection.to),
			onDrop: (editor, files, pos) => void insertFiles(editor, ctx, files, pos),
			consumePasteEvent: true
		})
	];
}

const pick = (id: string, label: string, keywords: string[], icon: string, accept: string, insert: typeof insertImage): SlashItem => ({
	id,
	label,
	keywords,
	icon,
	run(editor: Editor, range) {
		editor.chain().focus().deleteRange(range).run();
		const ctx = (editor.storage as unknown as { media: { ctx: EditorContext } }).media.ctx;
		chooseFile(accept, (file) => void insert(editor, ctx, file, editor.state.selection.to));
	}
});

export const mediaSlashItems: SlashItem[] = [
	pick('image', 'Image', ['picture', 'photo', 'upload'], 'image', 'image/*', insertImage),
	pick('file', 'File', ['attachment', 'upload', 'document', 'pdf'], 'file', '', insertFile)
];
