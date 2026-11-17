import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

declare global {
	interface Window {
		__cardMenuLoaded?: boolean;
	}
}

async function reisen(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste', body: 'Zelt', folder: 0 }] });
}

test('Scenario: Pin from a card menu', async ({ page, request }) => {
	const { notes } = await reisen(request);
	await calm(page);
	await open(page, '/');

	const recent = page.getByRole('main').getByRole('region', { name: 'Recently edited' });
	await expect(page.getByRole('main').getByRole('region', { name: 'Pinned' })).toHaveCount(0);
	await recent.getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Pin' }).click();

	await expect(page.getByRole('main').getByRole('region', { name: 'Pinned' }).getByRole('heading', { level: 3 })).toHaveText('Packliste');
	expect((await storedNote(request, notes[0]))!.pinnedAt).not.toBeNull();
	await recent.getByRole('button', { name: 'Note actions' }).click();
	await expect(page.getByRole('menuitem', { name: 'Unpin' })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Pin', exact: true })).toHaveCount(0);
});

test('Scenario: Move a note from its card', async ({ page, request }) => {
	const { folders, notes } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);
	await page.evaluate(() => (window.__cardMenuLoaded = true));

	await page.getByRole('list', { name: 'Notes' }).getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Root' }).click();

	await expect(page.locator('[data-note-row]')).toHaveCount(0);
	expect(await page.evaluate(() => window.__cardMenuLoaded)).toBe(true);
	expect((await storedNote(request, notes[0]))!.folderId).toBeNull();
});

test('Scenario: Delete a note from its card', async ({ page, request }) => {
	const { folders, notes } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);
	await page.evaluate(() => (window.__cardMenuLoaded = true));

	await page.getByRole('list', { name: 'Notes' }).getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog', { name: /Delete/ });
	await expect(dialog.getByRole('heading', { name: 'Delete “Packliste”?' })).toBeVisible();
	await expect(dialog.getByText("This can't be undone.", { exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await expect(page.locator('[data-note-row]')).toHaveCount(0);
	expect(await page.evaluate(() => window.__cardMenuLoaded)).toBe(true);
	expect(await storedNote(request, notes[0])).toBeNull();
});

test('Cancelled delete from a card keeps the note', async ({ page, request }) => {
	const { folders, notes } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await page.getByRole('list', { name: 'Notes' }).getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /Delete/ }).getByRole('button', { name: 'Cancel' }).click();

	await expect(page.getByRole('alertdialog', { name: /Delete/ })).toBeHidden();
	await expect(page.locator('[data-note-row]')).toHaveCount(1);
	expect(await storedNote(request, notes[0])).not.toBeNull();
});
