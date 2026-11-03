import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Search in the note menu opens the palette', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	if (info.project.name === 'phone') {
		await page.locator('[data-editor-root] .ProseMirror').click();
		await expect(page.locator('[data-bottom-bar]')).toHaveAttribute('aria-hidden', 'true');
	}

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Search' }).click();

	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await expect(page.getByRole('menu', { name: 'Note menu' })).toHaveCount(0);
});
