import type { APIRequestContext, Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { open, reset, seed } from './helpers.ts';

const WORD = 'Donaudampfschifffahrtselektrizitaetenhauptbetriebswerkbauunterbeamtengesellschaft';
const UNBROKEN = 'wirklich-sehr-lange-unteilbare-bezeichnung-ohne-leerzeichen-'.repeat(3);
const ICONS = ['📚', '🌿', '✈️', '🍳', '🎧'];

const text = (value: string): JSONContent => ({ type: 'text', text: value });
const paragraph = (value: string): JSONContent => ({ type: 'paragraph', content: [text(value)] });
const cell = (type: 'tableHeader' | 'tableCell', value: string): JSONContent => ({ type, content: [paragraph(value)] });
const table: JSONContent = {
	type: 'table',
	content: Array.from({ length: 6 }, (_, r) => ({
		type: 'tableRow',
		content: Array.from({ length: 9 }, (_, c) => cell(r === 0 ? 'tableHeader' : 'tableCell', r % 2 ? `${WORD} ${c}` : `Spalte ${c}`))
	}))
};
const longNote: JSONContent = {
	type: 'doc',
	content: [
		{ type: 'heading', attrs: { level: 2 }, content: [text(UNBROKEN)] },
		...Array.from({ length: 24 }, (_, i) => paragraph(`Absatz ${i + 1}. ${'Ein langer Satz, der umbricht und nie aufhört. '.repeat(5)}${i % 5 === 0 ? UNBROKEN : ''}`)),
		table,
		{ type: 'codeBlock', content: [text(`const zeile = '${UNBROKEN.repeat(3)}';`)] },
		{ type: 'bulletList', content: [{ type: 'listItem', content: [paragraph(WORD.repeat(2))] }] }
	]
};

export type Pages = { name: string; path: string }[];

// 12 folders deep, long and unbreakable names, many notes and tags, a long note in the deepest folder
export async function worstCase(request: APIRequestContext): Promise<Pages> {
	await reset(request);
	const names = Array.from({ length: 12 }, (_, i) => (i % 3 === 0 ? `${WORD} ${i}` : `Ebene ${i + 1}`));
	const folders = [
		...names.map((name, i) => ({ name, ...(i ? { parent: i - 1 } : { cover: true }) })),
		...Array.from({ length: 8 }, (_, i) => ({ name: i % 2 ? UNBROKEN : `Unterordner ${i + 1}`, parent: 11 })),
		...Array.from({ length: 5 }, (_, i) => ({ name: `Oben ${WORD.slice(0, 20 + i * 8)}` }))
	];
	const tags = ['Reise', WORD, 'a', 'Arbeit', UNBROKEN, 'Küche', 'Garten', 'Idee', 'Lesen', 'Musik'];
	const notes = [
		...Array.from({ length: 36 }, (_, i) => ({
			title: i % 3 === 0 ? `Notiz ${i + 1} ${UNBROKEN}` : `Notiz ${i + 1}`,
			icon: i % 2 ? ICONS[i % ICONS.length] : undefined,
			body: `${'Der Anfang einer Notiz mit genug Text für zwei Zeilen. '.repeat(3)}${i % 4 === 0 ? WORD : ''}`,
			folder: i % 6 === 0 ? 11 : i % 6 === 1 ? 0 : undefined,
			tags: tags.slice(0, 1 + (i % tags.length)),
			...(i < 6 ? { pinnedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00.000Z` } : {}),
			updatedAt: `2026-10-${String((i % 27) + 1).padStart(2, '0')}T10:00:00.000Z`
		})),
		{ title: `Lange Notiz ${UNBROKEN}`, content: longNote, folder: 11, tags, updatedAt: '2026-10-28T10:00:00.000Z' }
	];
	const { notes: ids, folders: folderIds } = await seed(request, { folders, notes });
	return [
		{ name: 'Home', path: '/' },
		{ name: 'Folders', path: '/folders' },
		{ name: 'deep folder', path: `/folders/${folderIds[11]}` },
		{ name: 'long note', path: `/notes/${ids[ids.length - 1]}` },
		{ name: 'search', path: '/search?q=notiz' },
		{ name: 'tag page', path: '' }
	];
}

async function tagPath(page: Page): Promise<string> {
	await open(page, '/');
	const href = await page.locator('a[href^="/tags/"]').first().getAttribute('href');
	if (!href) throw new Error('no tag link on Home');
	return href;
}

export async function screens(page: Page, request: APIRequestContext): Promise<Pages> {
	const list = await worstCase(request);
	list[list.length - 1].path = await tagPath(page);
	return list;
}
