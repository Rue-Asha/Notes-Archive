import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Note page shows icon, title and body', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', icon: '🌿', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page.locator('[data-note-header]').getByText('🌿', { exact: true })).toBeVisible();
	const title = page.getByRole('heading', { level: 1 }).getByRole('textbox', { name: 'Title' });
	await expect(title).toHaveValue('Garten');
	expect(await title.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Newsreader');
	const paragraph = page.locator('[data-editor-root] .ProseMirror p');
	await expect(paragraph).toHaveText('Beete umgraben');
	expect((await paragraph.boundingBox())!.y).toBeGreaterThan((await title.boundingBox())!.y);
});

test('Scenario: Opening a new empty note focuses the title', async ({ page, request }) => {
	await reset(request);
	const { id } = await (await request.post('/api/notes', { data: {} })).json();
	await calm(page);
	await open(page, `/notes/${id}`);

	const title = page.getByRole('textbox', { name: 'Title' });
	await expect(title).toBeFocused();
	await expect(title).toHaveAttribute('placeholder', 'Untitled');
});

test('Scenario: Untitled note\'s tab title reads Untitled', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ body: 'Nur Text' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page).toHaveTitle(/^Untitled/);
});

test('Scenario: Very long title wraps', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the long title is typed on phone');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const title = page.getByRole('textbox', { name: 'Title' });
	const oneLine = (await title.boundingBox())!.height;
	const long = 'Ein langer Titel über den Garten hinter dem Haus '.repeat(5).slice(0, 200);
	await title.click();
	await page.keyboard.type(long);

	await expect(title).toHaveValue(long);
	const box = (await title.boundingBox())!;
	expect(box.height).toBeGreaterThan(oneLine * 3);
	expect(box.x + box.width).toBeLessThanOrEqual(390);
	expect(await title.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Scenario: Unknown blocks render as text', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [{ title: 'Alt', content: { type: 'doc', content: [{ type: 'mysteryBlock', content: [{ type: 'text', text: 'Altes Format' }] }] } }]
	});
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page.locator('[data-editor-root] .ProseMirror > p')).toHaveText('Altes Format');
	expect(errors).toEqual([]);
});

test('missing note answers 404', async ({ request }) => {
	await reset(request);
	expect((await request.get('/notes/99999')).status()).toBe(404);
});
