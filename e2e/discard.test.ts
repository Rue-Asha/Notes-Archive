import { expect, test, type APIRequestContext } from '@playwright/test';
import { calm, clientNav, counts, open, reset, seed, storedNote } from './helpers.ts';

async function newNoteId(request: APIRequestContext): Promise<number> {
	return (await (await request.post('/api/notes', { data: {} })).json()).id;
}

test('Scenario: Empty new note is discarded on leaving', async ({ page, request }) => {
	await reset(request);
	const id = await newNoteId(request);
	await calm(page);
	await open(page, `/notes/${id}`);
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();

	await clientNav(page, '/');

	expect((await counts(request)).notes).toBe(0);
});

test('Scenario: Note with only a title is kept', async ({ page, request }) => {
	await reset(request);
	const id = await newNoteId(request);
	await calm(page);
	await open(page, `/notes/${id}`);
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
	await page.keyboard.type('Einkauf');

	await clientNav(page, '/');

	expect(await storedNote(request, id)).toMatchObject({ title: 'Einkauf', bodyText: '' });
});

test('closing the tab discards an empty new note', async ({ page, request }) => {
	await reset(request);
	const id = await newNoteId(request);
	await calm(page);
	await open(page, `/notes/${id}`);

	await page.close({ runBeforeUnload: true });

	await expect.poll(async () => (await counts(request)).notes).toBe(0);
});

test('an existing note cleared by hand is kept on leaving', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	const title = page.getByRole('textbox', { name: 'Title' });
	await title.fill('');
	await page.locator('[data-editor-root] .ProseMirror').click();
	await page.keyboard.press('ControlOrMeta+a');
	await page.keyboard.press('Backspace');

	await clientNav(page, '/');

	expect((await counts(request)).notes).toBe(1);
});
