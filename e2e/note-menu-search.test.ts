import { expect, test } from '@playwright/test';
import { calm, editor, open, reset, seed } from './helpers.ts';

test('Scenario: Search in the note menu opens the palette', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	if (info.project.name === 'phone') {
		await editor(page).click();
		await expect(page.getByRole('navigation', { name: 'Bottom bar', includeHidden: true })).toHaveAttribute('aria-hidden', 'true');
	}

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Search' }).click();

	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await expect(page.getByRole('menu', { name: 'Note menu' })).toHaveCount(0);
});
