import { expect, test, type Locator, type Page } from '@playwright/test';
import { editor, open, reset, seed, sidebar } from './helpers.ts';

const cursor = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).cursor);
const select = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).userSelect);
const chrome = ['default', 'pointer'];

async function seedDesk(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Travel' }],
		notes: [
			{
				title: 'Berlin trip',
				folder: 0,
				tags: ['draft'],
				pinnedAt: '2026-11-01T09:00:00.000Z',
				content: {
					type: 'doc',
					content: [
						{ type: 'paragraph', content: [{ type: 'text', text: 'Three days, one backpack.' }] },
						{ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Passport' }] }] }] }
					]
				}
			}
		]
	});
}

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'cursors are a pointer-device concern');
});

test('Scenario: Chrome text shows the default cursor', async ({ page, request }) => {
	const { folders, notes } = await seedDesk(request);

	await open(page, '/');
	const main = page.getByRole('main');
	for (const [name, el] of [
		['kicker', main.locator('.kicker li')],
		['heading', main.getByRole('heading', { level: 1 })],
		['section heading', main.getByRole('heading', { name: 'Pinned' })],
		['count', main.locator('.card-note')],
		['snippet', main.locator('[data-card-snippet]')],
		['meta', main.locator('[data-card-time]')],
		['tree folder row', sidebar(page).getByRole('link', { name: 'Travel' })],
		['tag row', sidebar(page).getByRole('link', { name: /draft/ })]
	] as const) {
		expect(chrome, `home ${name}`).toContain(await cursor(el));
	}

	await open(page, `/folders/${folders[0]}`);
	expect(chrome, 'folder heading').toContain(await cursor(page.getByRole('main').getByRole('heading', { level: 1 })));

	await open(page, `/notes/${notes[0]}`);
	expect(chrome, 'property label').toContain(await cursor(page.locator('.seg-label')));
	expect(chrome, 'save status').toContain(await cursor(page.locator('[data-save-state]')));
	await page.getByRole('button', { name: 'Note menu' }).click();
	expect(await cursor(page.getByRole('menuitem', { name: 'Delete' }))).toBe('pointer');
});

test('Scenario: Fields and the editor keep the text cursor', async ({ page, request }) => {
	const { notes } = await seedDesk(request);
	await open(page, `/notes/${notes[0]}`);

	expect(await cursor(page.getByRole('textbox', { name: 'Title' }))).toBe('text');
	expect(await cursor(page.getByRole('combobox', { name: 'Add a tag' }))).toBe('text');
	expect(await cursor(editor(page).locator('p').first())).toBe('text');
	expect(await cursor(editor(page).locator('input[type="checkbox"]'))).not.toBe('text');
	await expect(page.locator('[contenteditable="true"], [contenteditable=""]')).toHaveCount(1);
	await expect(page.locator('[contenteditable="true"]')).toHaveAttribute('aria-label', 'Note body');
});

// a double-click on a word selects it wherever selection is allowed; on chrome it must leave nothing. The click lands
// on the element's first word (not its box's centre, which can be blank space past the text)
async function dblSelects(page: Page, target: Locator): Promise<string> {
	const at = await target.first().evaluate((el) => {
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) });
		const text = walker.nextNode() as Text;
		const start = text.data.search(/\S/);
		const range = document.createRange();
		range.setStart(text, start);
		range.setEnd(text, start + 2);
		const r = range.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	});
	await page.evaluate(() => getSelection()?.removeAllRanges());
	await page.mouse.dblclick(at.x, at.y);
	return page.evaluate(() => getSelection()?.toString() ?? '');
}

test('Scenario: Chrome text does not start a selection', async ({ page, request }) => {
	const { notes } = await seedDesk(request);

	await open(page, '/');
	const main = page.getByRole('main');
	expect(await select(page.getByRole('button', { name: 'New note' }))).toBe('none');
	expect(await select(sidebar(page).getByRole('treeitem'))).toBe('none');
	for (const [name, el] of [
		['heading', main.getByRole('heading', { level: 1 })],
		['kicker', main.locator('.kicker li').last()],
		['lede', main.locator('.lede')],
		['section heading', main.getByRole('heading', { name: 'Pinned' })],
		['count', main.locator('.card-note')],
		['sidebar Tags heading', sidebar(page).getByRole('heading', { name: 'Tags' })]
	] as const) {
		expect(await select(el), `${name} computed`).toBe('none');
		expect(await dblSelects(page, el), `double-click on the ${name}`).toBe('');
	}
	// the card's whole face is its link, so a double-click there opens the note; its snippet is still no text to copy
	expect(await select(main.locator('[data-card-snippet]'))).toBe('none');

	// a drag from the main column across the sidebar
	const from = (await main.getByRole('heading', { level: 1 }).boundingBox())!;
	const to = (await sidebar(page).getByRole('heading', { name: 'Tags' }).boundingBox())!;
	await page.evaluate(() => getSelection()?.removeAllRanges());
	await page.mouse.move(from.x + from.width - 4, from.y + from.height / 2);
	await page.mouse.down();
	await page.mouse.move(to.x + 4, to.y + to.height / 2, { steps: 12 });
	await page.mouse.up();
	expect(await page.evaluate(() => getSelection()?.toString() ?? ''), 'a drag across main and sidebar').toBe('');

	await open(page, `/notes/${notes[0]}`);
	const title = page.getByRole('textbox', { name: 'Title' });
	await title.dblclick();
	expect(await title.evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart), 'the title field still selects').toBeGreaterThan(0);
	expect(await dblSelects(page, editor(page).locator('p').first()), 'the note body still selects').not.toBe('');

	await page.getByRole('button', { name: 'Note menu' }).click();
	expect(await select(page.getByRole('menuitem', { name: 'Delete' }))).toBe('none');
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog');
	await expect(dialog).toBeVisible();
	expect(await select(dialog.getByRole('heading'))).toBe('none');
	expect(await select(dialog.locator('p'))).toBe('none');
	expect(await dblSelects(page, dialog.getByRole('heading')), 'double-click on the dialog title').toBe('');
});
