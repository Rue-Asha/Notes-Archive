import { expect, test } from '@playwright/test';
import { calm, counts, open, reset, seed, storedNote } from './helpers.ts';

test('Scenario: Deleting the open note asks first and lands on its folder', async ({ page, request }) => {
	await reset(request);
	const { folders, notes } = await seed(request, { folders: [{ name: 'Küche' }], notes: [{ title: 'Rezept', body: 'Mehl', folder: 0, tags: ['Backen'] }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('dialog', { name: /Delete/ });
	await expect(dialog).toContainText("Delete “Rezept”? This can't be undone.");
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await page.waitForURL(`**/folders/${folders[0]}`);
	expect(await storedNote(request, notes[0])).toBeNull();
	expect((await counts(request)).tags).toBe(0);
});

test('Scenario: Deleting a root note lands on Home', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '', body: 'x' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(page.getByRole('dialog', { name: /Delete/ })).toContainText("Delete “Untitled”? This can't be undone.");
	await page.getByRole('dialog', { name: /Delete/ }).getByRole('button', { name: 'Delete' }).click();

	await page.waitForURL((url) => url.pathname === '/');
	expect(await storedNote(request, notes[0])).toBeNull();
});

test('Scenario: Cancelled note delete keeps everything', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Rezept', body: 'Mehl', tags: ['Backen'], images: 1 }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('dialog', { name: /Delete/ });
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).toHaveCount(0);

	expect(new URL(page.url()).pathname).toBe(`/notes/${notes[0]}`);
	expect((await storedNote(request, notes[0]))!.tags).toEqual(['Backen']);
	const c = await counts(request);
	expect(c.notes).toBe(1);
	expect(c.images).toBe(1);
	await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Rezept');
});
