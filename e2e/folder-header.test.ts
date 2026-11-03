import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Folder page shows breadcrumb, cover header and counts', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1, cover: true }, { name: 'Gion', parent: 2 }],
		notes: [1, 2, 3, 4].map((n) => ({ title: `Kyoto ${n}`, folder: 2 }))
	});
	await calm(page);
	await open(page, `/folders/${folders[2]}`);

	const crumbs = page.getByRole('main').getByRole('navigation', { name: 'Breadcrumb' });
	await expect(crumbs.getByRole('link')).toHaveText(['Reisen', 'Japan']);
	await expect(crumbs.getByRole('link').nth(0)).toHaveAttribute('href', `/folders/${folders[0]}`);
	await expect(crumbs.getByRole('link').nth(1)).toHaveAttribute('href', `/folders/${folders[1]}`);
	await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Kyoto');

	const header = page.locator('[data-cover-header]');
	await expect(header.locator('img')).toHaveCount(1);
	await expect(header.locator('img')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(header.getByRole('heading', { level: 1 })).toHaveText('Kyoto');
	await expect(header.locator('[data-folder-counts]')).toHaveText('1 folder · 4 notes');
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Folder without a cover gets a typographic band', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Island' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const header = page.locator('[data-cover-header]');
	await expect(header.locator('img')).toHaveCount(0);
	await expect(header.getByRole('heading', { level: 1 })).toHaveText('Island');
	await expect(header.locator('[data-folder-counts]')).toHaveText('0 folders · 0 notes');
});
