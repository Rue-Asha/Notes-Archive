import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

test('Scenario: Empty folder offers New note and New folder', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Leer' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const main = page.getByRole('main');
	await expect(main.getByText('Nothing here yet')).toBeVisible();
	await expect(main.getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(main.getByRole('button', { name: 'New folder' })).toBeVisible();
});

test('Scenario: New note from a folder page lands in that folder', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);

	await page.getByRole('main').getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))!.folderId).toBe(folders[1]);
});

test('Scenario: New folder from a folder page creates a sub-folder', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);

	await page.getByRole('main').getByRole('button', { name: 'New folder' }).click();
	const tile = page.locator('[data-folder-tile]', { hasText: 'Untitled folder' });
	await expect(tile).toBeVisible();
	const id = Number((await tile.getAttribute('href'))!.split('/').pop());
	const res = await request.get(`/api/folders/${id}`);
	expect((await res.json()).folder.parentId).toBe(folders[1]);
});
