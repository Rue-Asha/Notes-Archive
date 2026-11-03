import type { Schema } from '@tiptap/pm/model';
import type { JSONContent } from '#lib/types.ts';

type Raw = { type?: unknown; text?: unknown; content?: unknown; marks?: unknown };

const emptyDoc = (): JSONContent => ({ type: 'doc', content: [{ type: 'paragraph' }] });

const isRaw = (value: unknown): value is Raw => typeof value === 'object' && value !== null;

function kids(node: Raw): Raw[] {
	return Array.isArray(node.content) ? node.content.filter(isRaw) : [];
}

function textOf(node: Raw): string {
	if (typeof node.text === 'string') return node.text;
	return kids(node)
		.map((kid) => (typeof kid.text === 'string' ? kid.text : ` ${textOf(kid)} `))
		.join('')
		.replace(/\s+/g, ' ')
		.trim();
}

function clean(node: Raw, schema: Schema, inline: boolean): JSONContent[] {
	if (typeof node.type !== 'string') return [];
	if (node.type === 'text' && (typeof node.text !== 'string' || !node.text)) return [];
	const type = schema.nodes[node.type];
	if (!type) {
		const text = textOf(node);
		if (inline) return text ? [{ type: 'text', text }] : [];
		return [text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' }];
	}
	const out: JSONContent = { ...(node as JSONContent) };
	if (node.marks !== undefined) out.marks = marks(node, schema);
	if (node.content !== undefined) out.content = kids(node).flatMap((kid) => clean(kid, schema, type.inlineContent));
	return [out];
}

function marks(node: Raw, schema: Schema): JSONContent['marks'] {
	const list = Array.isArray(node.marks) ? (node.marks as { type?: unknown }[]) : [];
	return list.filter((m) => isRaw(m) && typeof m.type === 'string' && m.type in schema.marks) as JSONContent['marks'];
}

// Content written by an older or newer schema: node types this one doesn't know become paragraphs (or, inside a
// paragraph, plain text) holding their text, unknown marks are dropped, so ProseMirror never rejects the whole document.
export function sanitize(doc: unknown, schema: Schema): JSONContent {
	if (!isRaw(doc) || doc.type !== 'doc') return emptyDoc();
	const [out] = clean(doc, schema, false);
	return out.content?.length ? out : emptyDoc();
}
