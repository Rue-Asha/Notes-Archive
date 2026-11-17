import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar only exists from 1024 px');
});

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Sidebar' });
const width = async (page: Page) => Math.round((await sidebar(page).boundingBox())!.width);
const widthIs = (page: Page, px: number) => expect.poll(() => width(page)).toBe(px);
const hydrated = (page: Page) => page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

test('Scenario: One control folds the tree into a rail', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	await widthIs(page, 280);

	const fold = sidebar(page).getByRole('button', { name: 'Fold sidebar' });
	await expect(fold).toHaveAttribute('aria-expanded', 'true');
	await fold.click();
	await widthIs(page, 60);
	const unfold = sidebar(page).getByRole('button', { name: 'Unfold sidebar' });
	await expect(unfold).toHaveAttribute('aria-expanded', 'false');
	await expect(sidebar(page).getByRole('heading', { name: 'Folders' })).toBeHidden();

	await unfold.click();
	await widthIs(page, 280);
	await expect(sidebar(page).getByRole('button', { name: 'Fold sidebar' })).toHaveAttribute('aria-expanded', 'true');
	await expect(sidebar(page).getByRole('heading', { name: 'Folders' })).toBeVisible();
});

test('Scenario: Rail state survives a reload without a flash', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	await sidebar(page).getByRole('button', { name: 'Fold sidebar' }).click();
	await widthIs(page, 60);

	// no script bundle: only the server-rendered document and its inline head script run
	await page.route('**/_app/**/*.js', (route) => route.abort());
	await page.goto('/');
	await expect(sidebar(page)).toBeVisible();
	const before = (await sidebar(page).boundingBox())!;
	expect(Math.round(before.width)).toBe(60);
	const main = await page.getByRole('main').evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft));

	await page.unroute('**/_app/**/*.js');
	await page.reload();
	await hydrated(page);
	await expect(sidebar(page).getByRole('button', { name: 'Unfold sidebar' })).toBeVisible();
	expect(await sidebar(page).boundingBox()).toEqual(before);
	expect(await page.getByRole('main').evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft))).toBe(main);
});

test('Scenario: Storage unavailable falls back to expanded', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new Error('blocked');
			}
		});
	});
	await open(page, '/');

	await widthIs(page, 280);
	await expect(sidebar(page).getByRole('button', { name: 'Fold sidebar' })).toHaveAttribute('aria-expanded', 'true');
	await sidebar(page).getByRole('button', { name: 'Fold sidebar' }).click();
	await widthIs(page, 60);
	expect(errors).toEqual([]);
});

test('Scenario: Rail controls keep accessible names', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	await sidebar(page).getByRole('button', { name: 'Fold sidebar' }).click();
	await widthIs(page, 60);

	await expect(sidebar(page).getByRole('link', { name: 'Home' })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: /Search/ })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: 'Unfold sidebar' })).toBeVisible();
});

test('The content keeps clear of the rail', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const left = () => page.getByRole('main').evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft));
	const wide = await left();

	await sidebar(page).getByRole('button', { name: 'Fold sidebar' }).click();
	await expect.poll(left).toBeLessThan(wide);
	expect(await left()).toBeGreaterThanOrEqual(60 + 16);
});
