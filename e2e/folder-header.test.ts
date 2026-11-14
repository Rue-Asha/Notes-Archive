import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Folder page shows breadcrumb, cover header and counts', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1, cover: true }, { name: 'Gion', parent: 2 }],
		notes: [
			...[1, 2, 3, 4].map((n) => ({ title: `Kyoto ${n}`, folder: 2 })),
			...[1, 2].map((n) => ({ title: `Gion ${n}`, folder: 3 }))
		]
	});
	await calm(page);
	await open(page, `/folders/${folders[2]}`);

	const crumbs = page.getByRole('main').getByRole('navigation', { name: 'Breadcrumb' });
	await expect(crumbs.getByRole('link')).toHaveText(['Reisen', 'Japan']);
	await expect(crumbs.getByRole('link').nth(0)).toHaveAttribute('href', `/folders/${folders[0]}`);
	await expect(crumbs.getByRole('link').nth(1)).toHaveAttribute('href', `/folders/${folders[1]}`);
	await expect(crumbs.getByText('Kyoto', { exact: true })).toHaveAttribute('aria-current', 'page');

	// a plain <header> inside main has no landmark role; the folder header is the one holding the level-1 heading
	const header = page.getByRole('main').locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });
	await expect(header.getByRole('img').or(header.getByRole('presentation'))).toHaveCount(1);
	await expect(header.getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(header.getByRole('heading', { level: 1 })).toHaveText('Kyoto');
	await expect(header.getByText('1 folder · 6 notes', { exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Folder without a cover gets a typographic band', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Island' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	// a plain <header> inside main has no landmark role; the folder header is the one holding the level-1 heading
	const header = page.getByRole('main').locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });
	await expect(header.getByRole('img').or(header.getByRole('presentation'))).toHaveCount(0);
	await expect(header.getByRole('heading', { level: 1 })).toHaveText('Island');
	await expect(header.getByText('0 folders · 0 notes', { exact: true })).toBeVisible();
});
