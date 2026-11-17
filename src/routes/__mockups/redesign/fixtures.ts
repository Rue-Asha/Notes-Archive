export type TreeSort = 'mixed' | 'name' | 'edited' | 'created';

export interface MockNoteRef {
	id: number;
	title: string;
	icon: string | null;
}

export interface MockFolder {
	id: number;
	name: string;
	children: MockFolder[];
	notes: MockNoteRef[];
}

export interface MockTag {
	id: number;
	name: string;
	count: number;
}

export interface MockCard extends MockNoteRef {
	snippet: string;
	folder: string;
	tags: string[];
	updated: string;
}

export type MockBlock =
	| { type: 'heading'; level: 1 | 2 | 3; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'bulletList' | 'orderedList'; items: string[] }
	| { type: 'taskList'; items: { text: string; done: boolean }[] }
	| { type: 'quote' | 'callout' | 'code'; text: string }
	| { type: 'toggle'; summary: string; text: string }
	| { type: 'table'; rows: string[][] }
	| { type: 'image'; caption: string }
	| { type: 'file'; name: string; size: string }
	| { type: 'linkPreview'; title: string; host: string }
	| { type: 'divider' };

export interface MockData {
	worst: boolean;
	sort: TreeSort;
	tree: MockFolder[];
	tags: MockTag[];
	pinned: MockCard[];
	recent: MockCard[];
	folder: {
		name: string;
		path: string[];
		folders: { id: number; name: string; noteCount: number }[];
		notes: MockCard[];
		empty: boolean;
	};
	note: {
		title: string;
		icon: string | null;
		folderPath: string[];
		properties: { created: string; updated: string; tags: string[]; pinned: boolean };
		blocks: MockBlock[];
	};
	search: { query: string; hits: MockCard[]; idle: boolean };
	tagPage: { name: string; notes: MockCard[] };
}

const LONG_WORD = 'Donaudampfschifffahrtsgesellschaftskapitänslieder';
const LONG_TITLE =
	'Quarterly planning notes for the long-running archive migration, including every open question about folders, tags, pinned order, sorting, search ranking, link previews, file attachments and the many small decisions that never made it into a proper ticket';

const pad = (n: number) => String(n).padStart(2, '0');
const day = (n: number) => `2026-11-${pad(n)}T09:${pad(n)}:00.000Z`;

function nest(names: string[]): MockFolder {
	const [name, ...rest] = names;
	return { id: 100 + names.length, name, children: rest.length ? [nest(rest)] : [], notes: rest.length ? [] : [{ id: 900, title: 'Deepest note', icon: '📌' }] };
}

function cards(titles: string[], worst: boolean): MockCard[] {
	return titles.map((title, i) => ({
		id: i + 1,
		title,
		icon: i % 3 === 0 ? '📝' : null,
		snippet: worst && i % 2 === 0 ? `${LONG_WORD} ${'and then some more words that run on '.repeat(6)}` : 'A short line from the start of the note.',
		folder: worst ? `${LONG_WORD}` : 'Travel',
		tags: worst ? ['draft', LONG_WORD] : ['draft'],
		updated: day(14 - i)
	}));
}

function normalSet(): MockData {
	const pinned = cards(['Packing list', 'Reading queue', 'Weekly review'], false);
	const recent = cards(['Berlin trip', 'Recipe ideas', 'Meeting notes', 'Garden plan', 'Books 2026', 'Home repairs'], false);
	return {
		worst: false,
		sort: 'mixed',
		tree: [
			{ id: 1, name: 'Travel', children: [{ id: 11, name: 'Berlin', children: [], notes: [{ id: 5, title: 'Berlin trip', icon: '🚆' }] }], notes: [{ id: 1, title: 'Packing list', icon: '🧳' }] },
			{ id: 2, name: 'Cooking', children: [], notes: [{ id: 6, title: 'Recipe ideas', icon: null }] },
			{ id: 3, name: 'Work', children: [{ id: 31, name: 'Meetings', children: [], notes: [] }], notes: [] }
		],
		tags: [
			{ id: 1, name: 'draft', count: 12 },
			{ id: 2, name: 'idea', count: 7 },
			{ id: 3, name: 'reference', count: 4 },
			{ id: 4, name: 'later', count: 1 }
		],
		pinned,
		recent,
		folder: {
			name: 'Travel',
			path: [],
			folders: [
				{ id: 11, name: 'Berlin', noteCount: 3 },
				{ id: 12, name: 'Lisbon', noteCount: 1 }
			],
			notes: recent.slice(0, 4),
			empty: false
		},
		note: {
			title: 'Berlin trip',
			icon: '🚆',
			folderPath: ['Travel', 'Berlin'],
			properties: { created: day(2), updated: day(13), tags: ['draft', 'idea'], pinned: true },
			blocks: blocks(false)
		},
		search: { query: 'berlin', hits: recent.slice(0, 3), idle: false },
		tagPage: { name: 'draft', notes: recent.slice(0, 4) }
	};
}

function blocks(worst: boolean): MockBlock[] {
	return [
		{ type: 'heading', level: 1, text: worst ? LONG_TITLE.slice(0, LONG_TITLE.lastIndexOf(' ', 120)) : 'Overview' },
		{ type: 'paragraph', text: worst ? `${LONG_WORD} ${'Lorem ipsum dolor sit amet. '.repeat(30)}` : 'Three days, one backpack, no fixed plan beyond the first night.' },
		{ type: 'heading', level: 2, text: 'Sections' },
		{ type: 'heading', level: 3, text: 'Details' },
		{ type: 'bulletList', items: ['Trains', 'Hotel near the station', worst ? LONG_WORD : 'Museum pass'] },
		{ type: 'orderedList', items: ['Book the train', 'Pack', 'Leave'] },
		{ type: 'taskList', items: [{ text: 'Passport', done: true }, { text: 'Chargers', done: false }] },
		{ type: 'quote', text: 'Not all those who wander are lost.' },
		{ type: 'callout', text: 'Check the opening hours before going.' },
		{ type: 'toggle', summary: 'Backup plan', text: 'If it rains, the museums.' },
		{ type: 'code', text: 'const days = 3;\nconsole.log(days);' },
		{ type: 'table', rows: [['Day', 'Plan', 'Cost'], ['1', 'Arrive', '60 €'], ['2', worst ? LONG_WORD : 'Museums', '45 €']] },
		{ type: 'image', caption: 'View from the hotel' },
		{ type: 'file', name: 'tickets.pdf', size: '1.2 MB' },
		{ type: 'linkPreview', title: 'Visit Berlin', host: 'example.org' },
		{ type: 'divider' }
	];
}

function worstSet(): MockData {
	const base = normalSet();
	const names = Array.from({ length: 12 }, (_, i) => (i === 3 ? LONG_WORD : `Level ${i + 1} folder`));
	const tags = Array.from({ length: 40 }, (_, i) => ({ id: i + 1, name: i === 0 ? LONG_WORD : i === 1 ? 'עברית' : i === 2 ? '東京' : `tag-${i + 1}`, count: i === 0 ? 1 : (i * 37) % 1100 }));
	const pinned = cards([LONG_TITLE, 'Second pinned', LONG_WORD, 'Fourth'], true);
	const recent = cards([LONG_TITLE, LONG_WORD, '', '東京 trip', 'One', 'Two', 'Three', 'Four'], true).map((c) => (c.title ? c : { ...c, title: 'Untitled' }));
	return {
		...base,
		worst: true,
		sort: 'edited',
		tree: [nest(names), { id: 2, name: LONG_WORD, children: [], notes: [] }, { id: 3, name: 'Single', children: [], notes: [{ id: 3, title: LONG_TITLE, icon: null }] }],
		tags,
		pinned,
		recent,
		folder: {
			name: LONG_WORD,
			path: names,
			folders: [
				{ id: 11, name: LONG_WORD, noteCount: 1 },
				{ id: 12, name: 'Empty one', noteCount: 0 }
			],
			notes: recent.slice(0, 1),
			empty: false
		},
		note: {
			title: LONG_TITLE,
			icon: null,
			folderPath: names,
			properties: { created: day(1), updated: day(14), tags: tags.slice(0, 14).map((t) => t.name), pinned: true },
			blocks: blocks(true)
		},
		search: { query: `${LONG_WORD} ${LONG_TITLE.slice(0, 80)}`, hits: recent.slice(0, 1), idle: false },
		tagPage: { name: LONG_WORD, notes: recent.slice(0, 1) }
	};
}

export function mockData(url: URL): MockData {
	return url.searchParams.get('data') === 'worst' ? worstSet() : normalSet();
}
