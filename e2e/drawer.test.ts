import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'phone', 'the drawer only exists below 1024 px');
});

const folders = (page: Page) =>
	page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' });

test('Scenario: Folders opens the tree in a drawer', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await folders(page).click();
	const drawer = page.getByRole('dialog', { name: 'Folders' });
	await expect(drawer).toBeVisible();
});

test('Scenario: Escape or back closes the drawer', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const drawer = page.getByRole('dialog', { name: 'Folders' });

	await folders(page).click();
	await expect(drawer).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(drawer).toBeHidden();
	expect(new URL(page.url()).pathname).toBe('/');

	await folders(page).click();
	await expect(drawer).toBeVisible();
	await page.goBack();
	await expect(drawer).toBeHidden();
	expect(new URL(page.url()).pathname).toBe('/');
});

test('The drawer closes when a link in it is followed', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/search');

	await folders(page).click();
	const drawer = page.getByRole('dialog', { name: 'Folders' });
	await drawer.getByRole('link', { name: 'Home' }).click();
	await page.waitForURL((url) => url.pathname === '/');
	await expect(drawer).toBeHidden();
});

test('Following a link in the drawer leaves no stray history entry behind', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Garten' }] });
	await calm(page);
	await open(page, '/');
	const before = await page.evaluate(() => history.length);

	await folders(page).click();
	await page.getByRole('dialog', { name: 'Folders' }).getByRole('link', { name: 'Garten' }).click();
	await page.waitForURL((url) => url.pathname.startsWith('/folders/'));

	expect(await page.evaluate(() => history.length)).toBe(before + 1);
	await page.goBack();
	await expect(page).toHaveURL((url) => url.pathname === '/');
});
