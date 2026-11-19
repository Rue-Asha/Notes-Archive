import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const bar = (page: Page) => page.getByRole('toolbar', { name: 'Table' });

const cell = (type: 'tableHeader' | 'tableCell', value: string): JSONContent => ({
	type,
	content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }]
});
const table = (rows: number, cols: number, text = (r: number, c: number) => `${r}${c}`): JSONContent => ({
	type: 'table',
	content: Array.from({ length: rows }, (_, r) => ({
		type: 'tableRow',
		content: Array.from({ length: cols }, (_, c) => cell(r === 0 ? 'tableHeader' : 'tableCell', text(r, c)))
	}))
});

const shape = (node: JSONContent) => ({
	rows: node.content!.length,
	cols: node.content![0].content!.length,
	header: node.content![0].content!.every((c) => c.type === 'tableHeader')
});

test('Scenario: Table adds and removes rows and columns', async ({ page, request }) => {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [table(3, 3), { type: 'paragraph' }] };
	const { notes } = await seed(request, { notes: [{ title: 'Tabelle', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await expect(bar(page)).toBeHidden();
	await editor(page).getByRole('cell').first().click();
	await expect(bar(page)).toBeVisible();

	const steps: [string, number, number][] = [
		['Add row below', 4, 3],
		['Add column right', 4, 4],
		['Delete row', 3, 4],
		['Delete column', 3, 3]
	];
	for (const [name, rows, cols] of steps) {
		await bar(page).getByRole('button', { name }).click();
		await saves.settled();
		const stored = (await storedNote(request, notes[0]))!.content.content![0];
		expect(shape(stored), name).toEqual({ rows, cols, header: true });
		await expect(editor(page).getByRole('row')).toHaveCount(rows);
	}

	// the seeded table is followed by one plain paragraph outside it, which is the last paragraph in the body
	await editor(page).getByRole('paragraph').last().click();
	await expect(bar(page)).toBeHidden();
});

test('Scenario: Wide table scrolls inside its block on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	await reset(request);
	const long = (r: number, c: number) => `Eine ziemlich lange Zelle ${r}-${c} mit viel Text`;
	const content: JSONContent = { type: 'doc', content: [table(3, 6, long)] };
	const { notes } = await seed(request, { notes: [{ title: 'Breit', content }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const grid = editor(page).getByRole('table');
	await expect(grid).toBeVisible();
	// the table's parent is the block that scrolls
	const sizes = await grid.evaluate((t) => {
		const el = t.parentElement!;
		return { scroll: el.scrollWidth, client: el.clientWidth, overflowX: getComputedStyle(el).overflowX };
	});
	expect(sizes.overflowX).toBe('auto');
	expect(sizes.scroll).toBeGreaterThan(sizes.client);
	const page$ = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
	expect(page$.scroll).toBeLessThanOrEqual(page$.client);
});

test('Scenario: Table cells are told apart by hairlines and a shaded header row', async ({ page, request }) => {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [table(3, 3, (r, c) => `Zelle ${r}-${c}`), { type: 'paragraph' }] };
	const { notes } = await seed(request, { notes: [{ title: 'Linien', content }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const style = (selector: string) =>
		editor(page).locator(selector).first().evaluate((el) => {
			const cs = getComputedStyle(el);
			const side = (s: 'Top' | 'Right' | 'Bottom' | 'Left') => ({ width: parseFloat(cs[`border${s}Width`]), color: cs[`border${s}Color`] });
			return { top: side('Top'), right: side('Right'), bottom: side('Bottom'), left: side('Left'), background: cs.backgroundColor, weight: cs.fontWeight };
		});
	const th = await style('th');
	const td = await style('td');

	for (const cell of [th, td]) {
		for (const side of [cell.top, cell.right, cell.bottom, cell.left]) {
			expect(side.width).toBeGreaterThan(0);
			expect(side.width).toBeLessThanOrEqual(1);
			expect(side.color).not.toBe('rgba(0, 0, 0, 0)');
		}
	}
	expect(th.background).not.toBe(td.background);
	expect(th.background).not.toBe('rgba(0, 0, 0, 0)');
	expect(Number(th.weight)).toBeGreaterThan(Number(td.weight));
});
