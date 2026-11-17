import { expect, test, type Page } from '@playwright/test';
import { calm, isDesktop, open, reset, seed } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(isDesktop(info), 'phone drill-down');
});

const main = (page: Page) => page.getByRole('main');
const back = (page: Page) => main(page).getByRole('navigation', { name: 'Back' }).getByRole('link');
const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function reisen(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [
			{ title: 'Packliste', folder: 0 },
			{ title: 'Tempel', folder: 1 },
			{ title: 'Schrein', folder: 2 }
		]
	});
}

test('Scenario: Each level is its own page', async ({ page, request }) => {
	const { folders } = await reisen(request);
	await calm(page);
	await open(page, '/folders');

	await main(page).getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Reisen/ }).click();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Reisen');
	await expect(main(page).getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Japan/ })).toContainText('2 notes');
	await expect(main(page).getByRole('list', { name: 'Notes' }).getByRole('link', { name: /Packliste/ })).toBeVisible();

	await main(page).getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Japan/ }).click();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[1]}`);
	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Japan');
	await expect(main(page).getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Kyoto/ })).toContainText('1 note');
	await expect(main(page).getByRole('list', { name: 'Notes' }).getByRole('link', { name: /Tempel/ })).toBeVisible();
});

test('Scenario: Back goes up a level', async ({ page, request }) => {
	const { folders } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);
	await main(page).getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Japan/ }).click();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[1]}`);

	await page.goBack();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
	await page.goForward();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[1]}`);

	await expect(back(page)).toHaveText('Reisen');
	await back(page).click();
	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);

	await expect(back(page)).toHaveText('Folders');
	await back(page).click();
	await page.waitForURL((url) => url.pathname === '/folders');
});

test('Scenario: Deep levels stay readable', async ({ page, request }) => {
	await reset(request);
	const long = 'Ein außergewöhnlich langer Ordnername '.repeat(4).slice(0, 120);
	const names = Array.from({ length: 12 }, (_, i) => (i === 10 ? 'Zwischenebene'.repeat(5) : i === 11 ? long : `Ebene ${i + 1}`));
	const { folders } = await seed(request, { folders: names.map((name, i) => (i === 0 ? { name } : { name, parent: i - 1 })) });
	await page.setViewportSize({ width: 320, height: 640 });
	await calm(page);
	await open(page, `/folders/${folders[11]}`);

	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText(long.trim());
	await expect(back(page)).toHaveAttribute('title', names[10]);
	const box = (await back(page).boundingBox())!;
	expect(box.x + box.width).toBeLessThanOrEqual(320);
	expect(await noScroll(page)).toBe(true);
});

test('Scenario: Empty level offers New note and New folder', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Leer' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(main(page).getByText('Nothing here yet')).toBeVisible();
	await expect(main(page).getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(main(page).getByRole('button', { name: 'New folder' })).toBeVisible();
});
