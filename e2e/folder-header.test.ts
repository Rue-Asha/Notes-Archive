import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Folder page shows breadcrumb, cover header and counts', async ({ page, request }, info) => {
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

	const main = page.getByRole('main');
	const crumbs = main.getByRole('navigation', { name: 'Breadcrumb' });
	const more = crumbs.getByRole('button', { name: 'Show all 2 parent folders' });
	// below 1100 px two ancestors already fold into "…"; the desktop project runs at 1280×800, the phone at 390×844
	if (info.project.name === 'phone') {
		await expect(crumbs.getByRole('link', { name: 'Reisen' })).toHaveCount(0);
		await more.click();
	} else await expect(more).toHaveCount(0);
	await expect(crumbs.locator('li:not(:has(button))')).toHaveText(['Folders', 'Reisen', 'Japan', 'Kyoto']);
	await expect(crumbs.getByRole('link', { name: 'Reisen' })).toHaveAttribute('href', `/folders/${folders[0]}`);
	await expect(crumbs.getByRole('link', { name: 'Japan' })).toHaveAttribute('href', `/folders/${folders[1]}`);
	await expect(crumbs.getByText('Kyoto', { exact: true })).toHaveAttribute('aria-current', 'page');

	const header = main.locator('[data-folder-header]');
	await expect(header.locator('[data-cover] img')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(header.getByRole('heading', { level: 1 })).toHaveText('Kyoto');
	await expect(header.getByText('1 folder · 6 notes', { exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Regression: the breadcrumb hands the focus on and folds again on the next folder', async ({ page, request }, info) => {
	const names = Array.from({ length: 12 }, (_, i) => `Ebene ${i + 1}`);
	await reset(request);
	const { folders } = await seed(request, { folders: names.map((name, i) => (i === 0 ? { name } : { name, parent: i - 1 })) });
	await calm(page);
	await open(page, `/folders/${folders[11]}`);
	const crumbs = page.getByRole('main').getByRole('navigation', { name: 'Breadcrumb' });

	await crumbs.getByRole('button', { name: 'Show all 11 parent folders' }).click();
	// the first folder "…" showed: the phone hides the whole path, the desktop keeps the first ancestor
	await expect(crumbs.getByRole('link', { name: info.project.name === 'phone' ? names[0] : names[1], exact: true })).toBeFocused();
	await crumbs.getByRole('button', { name: 'Shorten path' }).click();
	await expect(crumbs.getByRole('button', { name: 'Show all 11 parent folders' })).toBeFocused();

	await crumbs.getByRole('button', { name: 'Show all 11 parent folders' }).click();
	await crumbs.getByRole('link', { name: names[10], exact: true }).click();
	await page.waitForURL(`**/folders/${folders[10]}`);
	await expect(crumbs.getByRole('button', { name: 'Show all 10 parent folders' })).toBeVisible();
	await expect(crumbs.getByRole('link', { name: names[4], exact: true })).toHaveCount(0);
});

test('Regression: a long ancestor name ends in an ellipsis', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Donaudampfschifffahrtsgesellschaft' }, { name: 'Wien', parent: 0 }] });
	await calm(page);
	await page.setViewportSize({ width: 1280, height: 800 });
	await open(page, `/folders/${folders[1]}`);
	const crumbs = page.getByRole('main').getByRole('navigation', { name: 'Breadcrumb' });
	const link = crumbs.getByRole('link', { name: 'Donaudampfschifffahrtsgesellschaft' });
	await expect(link).toBeVisible();
	// a flex box would clip the text without drawing the ellipsis
	const cut = await link.evaluate((el) => ({ clipped: el.scrollWidth > el.clientWidth, ellipsis: getComputedStyle(el).textOverflow, flex: getComputedStyle(el).display.includes('flex') }));
	expect(cut).toEqual({ clipped: true, ellipsis: 'ellipsis', flex: false });
});

test('Regression: the breadcrumb "…" takes a full touch target', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }] });
	await calm(page);
	await open(page, `/folders/${folders[2]}`);
	const more = page.getByRole('main').getByRole('navigation', { name: 'Breadcrumb' }).getByRole('button', { name: 'Show all 2 parent folders' });
	if (info.project.name !== 'phone') {
		await expect(more).toHaveCount(0);
		return;
	}
	const box = (await more.boundingBox())!;
	// the pill stays small; .hit grows what a finger can press to 44 × 44 around its centre
	const hits = await more.evaluate((el, b) => {
		const x = b.x + b.width / 2;
		const y = b.y + b.height / 2;
		return [[x - 21, y], [x + 21, y], [x, y - 21], [x, y + 21]].map(([px, py]) => el.contains(document.elementFromPoint(px, py)));
	}, box);
	expect(hits).toEqual([true, true, true, true]);
});
