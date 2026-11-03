import { expect, test, type APIRequestContext } from '@playwright/test';
import { COPY } from '../src/lib/copy.ts';
import { calm, clientNav, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

async function newNoteId(request: APIRequestContext): Promise<number> {
	return (await (await request.post('/api/notes', { data: {} })).json()).id;
}

test('Scenario: Typing saves automatically', async ({ page, request }) => {
	await reset(request);
	const id = await newNoteId(request);
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${id}`);

	const status = page.locator('[data-save-state]');
	const title = page.getByRole('textbox', { name: 'Title' });
	await expect(title).toBeFocused();
	await page.keyboard.type('Gartenplan');
	await expect(status).toHaveText(COPY.saving);
	await expect(status).toHaveText(COPY.saved);

	await page.keyboard.press('Enter');
	await page.keyboard.type('Erste Zeile');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Zweite Zeile');
	await expect(status).toHaveText(COPY.saving);
	await expect(status).toHaveText(COPY.saved);

	await saves.settled();
	await page.reload();
	await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Gartenplan');
	await expect(page.locator('[data-editor-root] .ProseMirror > p')).toHaveText(['Erste Zeile', 'Zweite Zeile']);
});

test('Scenario: Leaving flushes a pending save', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Notiz' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await page.locator('[data-editor-root] .ProseMirror').click();
	await page.keyboard.type('Wort');
	await clientNav(page, '/');

	expect((await storedNote(request, notes[0]))!.bodyText).toBe('Wort');
});

test('Scenario: Saves settle before a reload', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Zähler', body: 'x' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	let expected = 'x';
	for (let i = 0; i < 10; i++) {
		await page.locator('[data-editor-root] .ProseMirror p').click();
		await page.keyboard.press('End');
		await page.keyboard.type(String(i));
		expected += String(i);
		await saves.settled();
		await page.reload();
		await expect(page.locator('[data-editor-root] .ProseMirror p')).toHaveText(expected);
	}
});

test('Scenario: Last write wins between two tabs', async ({ page, context, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Start' }] });
	const other = await context.newPage();
	const tabs = [page, other];
	const saves = tabs.map((tab) => watchSaves(tab));
	for (const tab of tabs) {
		await calm(tab);
		await open(tab, `/notes/${notes[0]}`);
	}

	for (const [i, text] of ['Eins', 'Zwei'].entries()) {
		const title = tabs[i].getByRole('textbox', { name: 'Title' });
		await title.fill('');
		await title.pressSequentially(text);
		await saves[i].settled();
		expect((await storedNote(request, notes[0]))!.title).toBe(text);
	}

	expect((await storedNote(request, notes[0]))!.title).toBe('Zwei');
});
