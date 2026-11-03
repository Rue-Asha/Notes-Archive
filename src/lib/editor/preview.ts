import { Extension, type AnyExtension } from '@tiptap/core';
import { closeHistory } from '@tiptap/pm/history';
import { Plugin, Selection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { LinkPreview as Preview } from '#lib/types.ts';
import type { EditorContext } from './context.ts';
import { LinkPreview } from './linkPreview.ts';
import { domainOf, standaloneUrl } from './urls.ts';

// two history steps: the linked paragraph, then the card, so one undo leaves the plain link
function cardFor(view: EditorView, url: string): boolean {
	const { state } = view;
	const { $from, empty } = state.selection;
	const type = state.schema.nodes.linkPreview;
	if (!empty || $from.parent.type.name !== 'paragraph' || $from.parent.content.size) return false;
	const container = $from.node($from.depth - 1);
	if (!container.canReplaceWith($from.index($from.depth - 1), $from.indexAfter($from.depth - 1), type)) return false;

	const from = $from.pos;
	view.dispatch(state.tr.insertText(url, from).addMark(from, from + url.length, state.schema.marks.link.create({ href: url })));

	const before = $from.before();
	const tr = closeHistory(view.state.tr);
	const card = type.create({ url, domain: domainOf(url) });
	tr.replaceWith(before, before + view.state.doc.resolve(before).nodeAfter!.nodeSize, card);
	const after = before + card.nodeSize;
	if (after >= tr.doc.content.size) tr.insert(after, state.schema.nodes.paragraph.create());
	view.dispatch(tr.setSelection(Selection.near(tr.doc.resolve(after), 1)));
	return true;
}

async function fill(view: EditorView, url: string, noteId: number): Promise<void> {
	const res = await fetch('/api/preview', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ url, noteId })
	}).catch(() => null);
	if (!res?.ok) return;
	const preview = (await res.json()) as Preview;
	// every bare card for this URL, not the first: an older one would otherwise take the preview meant for the new card
	const targets: number[] = [];
	view.state.doc.descendants((node, pos) => {
		if (node.type.name === 'linkPreview' && node.attrs.url === url && !node.attrs.title && !node.attrs.imageId) targets.push(pos);
		return true;
	});
	if (!targets.length) return;
	const { domain, title, description, siteName, imageId } = preview;
	const tr = view.state.tr.setMeta('addToHistory', false);
	for (const pos of targets) tr.setNodeMarkup(pos, undefined, { ...tr.doc.nodeAt(pos)!.attrs, domain, title, description, siteName, imageId });
	view.dispatch(tr);
}

export function previewExtensions(ctx: EditorContext): AnyExtension[] {
	return [
		LinkPreview,
		Extension.create({
			name: 'linkPreviewPaste',
			// ahead of the Link extension's own paste handling
			priority: 1100,
			addProseMirrorPlugins: () => [
				new Plugin({
					props: {
						handlePaste(view, event) {
							const url = standaloneUrl(event.clipboardData?.getData('text/plain') ?? '');
							if (!url || !cardFor(view, url)) return false;
							event.preventDefault();
							void fill(view, url, ctx.noteId);
							return true;
						}
					}
				})
			]
		})
	];
}
