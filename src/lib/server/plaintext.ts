import type { Id } from '#lib/types.ts';

type Node = { type?: unknown; attrs?: Record<string, unknown>; content?: unknown; text?: unknown };

const ATOMS = new Set(['image', 'fileCard', 'linkPreview', 'horizontalRule']);

function isNode(value: unknown): value is Node {
	return typeof value === 'object' && value !== null;
}

function children(node: Node): Node[] {
	return Array.isArray(node.content) ? node.content.filter(isNode) : [];
}

const isInline = (node: Node) => node.type === 'text' || node.type === 'hardBreak';

function inlineText(node: Node): string {
	if (node.type === 'hardBreak') return '\n';
	return typeof node.text === 'string' ? node.text : '';
}

// a node whose children are all inline is one block of text; anything else only passes its children's lines up
function lines(node: Node, out: string[]): void {
	const kids = children(node);
	let run = '';
	const flush = () => {
		for (const line of run.split('\n')) if (line.trim()) out.push(line);
		run = '';
	};
	for (const kid of kids) {
		if (isInline(kid)) run += inlineText(kid);
		else {
			flush();
			lines(kid, out);
		}
	}
	flush();
}

export function plainText(doc: unknown): string {
	if (!isNode(doc)) return '';
	const out: string[] = [];
	lines(doc, out);
	return out.join('\n');
}

export function snippet(bodyText: string): string {
	return bodyText.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function hasAtom(node: Node): boolean {
	return (typeof node.type === 'string' && ATOMS.has(node.type)) || children(node).some(hasAtom);
}

export function isEmptyDoc(doc: unknown): boolean {
	return plainText(doc).trim() === '' && !(isNode(doc) && hasAtom(doc));
}

export function referencedUploads(doc: unknown): { images: Id[]; files: Id[] } {
	const images = new Set<Id>();
	const files = new Set<Id>();
	const add = (set: Set<Id>, id: unknown) => {
		if (typeof id === 'number') set.add(id);
	};
	const walk = (node: unknown) => {
		if (!isNode(node)) return;
		if (node.type === 'image') add(images, node.attrs?.id);
		else if (node.type === 'linkPreview') add(images, node.attrs?.imageId);
		else if (node.type === 'fileCard') add(files, node.attrs?.id);
		children(node).forEach(walk);
	};
	walk(doc);
	return { images: [...images], files: [...files] };
}
