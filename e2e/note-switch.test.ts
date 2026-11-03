import { expect, test } from '@playwright/test';
import { calm, clientNav, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

test('typing in the next note saves after an empty note was discarded', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Zwei', body: 'Anfang' }] });
	const blank = (await (await request.post('/api/notes', { data: {} })).json()).id;
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${blank}`);
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();

	await clientNav(page, `/notes/${notes[0]}`);
	expect(await storedNote(request, blank)).toBeNull();
	await page.locator('[data-editor-root] .ProseMirror').click();
	await page.keyboard.press('ControlOrMeta+End');
	await page.keyboard.type(' Ende');
	await saves.settled();

	await expect.poll(async () => (await storedNote(request, notes[0]))?.bodyText).toContain('Ende');
});

test('a deleted note does not stop the next note from saving', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Eins', body: 'a' }, { title: 'Zwei', body: 'b' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await page.evaluate((id) => fetch(`/api/notes/${id}`, { method: 'DELETE' }), notes[0]);
	await page.getByRole('textbox', { name: 'Title' }).fill('Eins!');
	await expect(page.getByRole('alert')).toBeVisible();

	await clientNav(page, `/notes/${notes[1]}`);
	await expect(page.getByRole('alert')).toHaveCount(0);
	await page.getByRole('textbox', { name: 'Title' }).fill('Zwei!');
	await saves.settled();

	await expect.poll(async () => (await storedNote(request, notes[1]))?.title).toBe('Zwei!');
});

test('a new note opened from a note page has the cursor in its title', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Alt', body: 'text' }] });
	const fresh = (await (await request.post('/api/notes', { data: {} })).json()).id;
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await clientNav(page, `/notes/${fresh}`);

	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
});
