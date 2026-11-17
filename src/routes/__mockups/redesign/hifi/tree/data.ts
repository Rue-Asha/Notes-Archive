import { mockData, type MockCard, type MockData, type MockFolder, type MockNoteRef, type TreeSort } from '../../fixtures.ts';

export interface WireFolder extends MockFolder {
	children: WireFolder[];
	count?: number;
}

export interface TreeView {
	path: { id: number; name: string }[];
	focus: { id: number; name: string } | null;
	nodes: WireFolder[];
	notes: MockNoteRef[];
	current: number | null;
	open: number[];
	empty: boolean;
}

// page.url is Kit's read-only URL, not a URL
export const dataFor = (url: { href: string }): MockData => mockData(new URL(url.href));
export const base = '/__mockups/redesign/hifi';

export const link = (slug: string, worst: boolean) => `${base}/${slug}${worst ? '?data=worst' : ''}`;
export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
export const countNotes = (f: WireFolder): number => f.count ?? f.notes.length + f.children.reduce((n, c) => n + countNotes(c), 0);
export const countFolders = (f: WireFolder): number => f.children.length + f.children.reduce((n, c) => n + countFolders(c), 0);
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const ref = (c: MockCard): MockNoteRef => ({ id: c.id, title: c.title, icon: c.icon });

function notesFor(n: number, from: string): MockNoteRef[] {
	return Array.from({ length: Math.min(n, 3) }, (_, i) => ({ id: 700 + i, title: i === 2 && n > 2 ? '' : `${from} ${i + 1}`, icon: null }));
}

const EXTRA = ['A', '東京の旅', 'מסמכים', 'Archive', 'Uni — Semester 1', 'Uni — Semester 2', 'Recipes', 'Receipts 2024', 'Taxes', 'Health', 'Ideas'];

// the fixtures' folder page and tree disagree on counts; this makes one tree both the sidebar and the folder page read
export function wireTree(data: MockData): WireFolder[] {
	const f = data.folder;
	const kids: WireFolder[] = f.folders.map((x) => ({
		id: x.id,
		name: x.name,
		children: [],
		notes: x.id === 11 && !data.worst ? [{ id: 5, title: 'Berlin trip', icon: '🚆' }, ...notesFor(x.noteCount - 1, 'Museum list')] : notesFor(x.noteCount, 'Note')
	}));
	const page: WireFolder = { id: data.worst ? 99 : 1, name: f.name, children: kids, notes: f.notes.map(ref) };
	if (!data.worst) return [page, ...(data.tree.slice(1) as WireFolder[])];
	const [deep, ...rest] = data.tree as WireFolder[];
	const bottom = (n: WireFolder): WireFolder => (n.children.length ? { ...n, children: [bottom(n.children[0])] } : { ...n, children: [page] });
	const extra = EXTRA.map((name, i) => ({ id: 200 + i, name, children: [], notes: [] }));
	return [bottom(deep), ...rest, ...extra, { id: 299, name: 'Everything else', children: [], notes: [], count: 1284 }];
}

export function findPath(tree: WireFolder[], match: (f: WireFolder) => boolean, trail: WireFolder[] = []): WireFolder[] | null {
	for (const f of tree) {
		if (match(f)) return [...trail, f];
		const hit = findPath(f.children, match, [...trail, f]);
		if (hit) return hit;
	}
	return null;
}

export function resolveTree(tree: WireFolder[], opts: { focus?: number | null; note?: number | null; open?: number[]; empty?: boolean } = {}): TreeView {
	const { note = null, open = [], empty = false } = opts;
	if (empty) return { path: [], focus: null, nodes: [], notes: [], current: null, open: [], empty: true };
	let focusId = opts.focus ?? null;
	if (focusId === null && note !== null) focusId = findPath(tree, (f) => f.notes.some((n) => n.id === note))?.at(-1)?.id ?? null;
	const trail = focusId === null ? null : findPath(tree, (f) => f.id === focusId);
	const focus = trail?.at(-1) ?? null;
	const nodes = focus ? focus.children : tree;
	const inside = note === null ? null : findPath(nodes, (f) => f.notes.some((n) => n.id === note));
	return {
		path: (trail ?? []).slice(0, -1).map((f) => ({ id: f.id, name: f.name })),
		focus: focus ? { id: focus.id, name: focus.name } : null,
		nodes,
		notes: focus ? focus.notes : [],
		current: note,
		open: [...open, ...(inside ?? []).map((f) => f.id)],
		empty: false
	};
}

// which folder the shell's tree sits on for a given screen: the folder page's folder, the open note's folder, else the top level
export function viewFor(data: MockData, screen: string): TreeView {
	const tree = wireTree(data);
	if (screen === 'folder') return resolveTree(tree, { focus: data.worst ? 99 : 1 });
	if (screen === 'note') return resolveTree(tree, { note: data.worst ? 900 : 5 });
	return resolveTree(tree);
}
