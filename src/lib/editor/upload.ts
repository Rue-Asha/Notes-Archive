import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, Selection, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { COPY } from '#lib/copy.ts';
import type { Id, UploadedFile, UploadedImage } from '#lib/types.ts';
import type { EditorContext } from './context.ts';

export const MAX_BYTES = 16 * 1024 * 1024;

type Candidate = { type: string; size: number };

export const imageProblem = (file: Candidate): string | null =>
	!file.type.startsWith('image/') ? COPY.notAnImage : file.size > MAX_BYTES ? COPY.imageTooLarge : null;

export const fileProblem = (file: Candidate): string | null => (file.size > MAX_BYTES ? COPY.fileTooLarge : null);

export function failureMessage(status: number): string {
	if (status === 413) return COPY.imageTooLarge;
	if (status === 415) return COPY.notAnImage;
	return COPY.uploadFailed;
}

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const units = ['KB', 'MB', 'GB'];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	return `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

class UploadFailed extends Error {}

async function post<T>(url: string, file: File, headers: Record<string, string> = {}): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url, { method: 'POST', headers: { 'content-type': file.type || 'application/octet-stream', ...headers }, body: file });
	} catch {
		throw new UploadFailed(COPY.uploadFailed);
	}
	if (!res.ok) throw new UploadFailed(failureMessage(res.status));
	return (await res.json()) as T;
}

export const postImage = (noteId: Id, file: File) => post<UploadedImage>(`/api/notes/${noteId}/images`, file);
export const postFile = (noteId: Id, file: File) =>
	post<UploadedFile>(`/api/notes/${noteId}/files`, file, { 'x-filename': encodeURIComponent(file.name) });

// the placeholder lives in a decoration, not in the document, so a half-finished upload can never be saved
const placeholders = new PluginKey<DecorationSet>('uploadPlaceholders');
let tokens = 0;

export const uploadPlaceholders = () =>
	new Plugin<DecorationSet>({
		key: placeholders,
		state: {
			init: () => DecorationSet.empty,
			apply(tr, set) {
				set = set.map(tr.mapping, tr.doc);
				const add = tr.getMeta(placeholders) as { add?: { token: number; pos: number }; remove?: number } | undefined;
				if (add?.add) {
					const el = document.createElement('div');
					el.className = 'upload-placeholder';
					el.setAttribute('role', 'status');
					el.setAttribute('aria-label', 'Uploading');
					set = set.add(tr.doc, [Decoration.widget(add.add.pos, el, { token: add.add.token, side: -1 })]);
				}
				if (add?.remove !== undefined) set = set.remove(set.find(undefined, undefined, (spec) => spec.token === add.remove));
				return set;
			}
		},
		props: {
			decorations: (state) => placeholders.getState(state)
		}
	});

function begin(editor: Editor, pos: number): number {
	const token = ++tokens;
	editor.view.dispatch(editor.state.tr.setMeta(placeholders, { add: { token, pos } }).setMeta('addToHistory', false));
	return token;
}

// An empty paragraph is replaced by the block; otherwise it goes after the block the position is in.
function place(tr: Transaction, pos: number, node: PMNode): number {
	const $pos = tr.doc.resolve(Math.min(pos, tr.doc.content.size));
	let from = pos;
	let to = pos;
	if ($pos.parent.isTextblock) {
		const empty = $pos.parent.type.name === 'paragraph' && $pos.parent.content.size === 0;
		from = empty ? $pos.before() : $pos.after();
		to = empty ? $pos.after() : from;
	}
	tr.replaceWith(from, to, node);
	const after = from + node.nodeSize;
	if (after >= tr.doc.content.size) tr.insert(after, tr.doc.type.schema.nodes.paragraph.create());
	tr.setSelection(Selection.near(tr.doc.resolve(after), 1));
	return after;
}

function settle(editor: Editor, token: number, node: PMNode | null): number | null {
	const [found] = placeholders.getState(editor.state)?.find(undefined, undefined, (spec) => spec.token === token) ?? [];
	const tr = editor.state.tr.setMeta(placeholders, { remove: token });
	let end: number | null = null;
	if (found && node) end = place(tr, found.from, node);
	editor.view.dispatch(tr);
	return end;
}

async function run<T>(editor: Editor, ctx: EditorContext, pos: number, send: () => Promise<T>, build: (done: T) => PMNode): Promise<number | null> {
	const token = begin(editor, pos);
	try {
		return settle(editor, token, build(await send()));
	} catch (e) {
		settle(editor, token, null);
		ctx.toast(e instanceof UploadFailed ? e.message : COPY.uploadFailed, 'error');
		return null;
	}
}

export function insertImage(editor: Editor, ctx: EditorContext, file: File, pos: number): Promise<number | null> {
	const problem = imageProblem(file);
	if (problem) {
		ctx.toast(problem, 'error');
		return Promise.resolve(null);
	}
	return run(editor, ctx, pos, () => postImage(ctx.noteId, file), (img) =>
		editor.schema.nodes.image.create({ id: img.id, width: img.width, height: img.height })
	);
}

export function insertFile(editor: Editor, ctx: EditorContext, file: File, pos: number): Promise<number | null> {
	const problem = fileProblem(file);
	if (problem) {
		ctx.toast(problem, 'error');
		return Promise.resolve(null);
	}
	return run(editor, ctx, pos, () => postFile(ctx.noteId, file), (f) =>
		editor.schema.nodes.fileCard.create({ id: f.id, name: f.name, size: f.size, mime: f.mime })
	);
}

export async function insertFiles(editor: Editor, ctx: EditorContext, files: File[], pos: number): Promise<void> {
	for (const file of files) {
		const insert = file.type.startsWith('image/') ? insertImage : insertFile;
		pos = (await insert(editor, ctx, file, pos)) ?? pos;
	}
}

export function chooseFile(accept: string, onpick: (file: File) => void): void {
	const input = document.createElement('input');
	input.type = 'file';
	if (accept) input.accept = accept;
	input.addEventListener('change', () => {
		const file = input.files?.[0];
		if (file) onpick(file);
	});
	input.click();
}
