import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar only exists from 1024 px');
});

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Sidebar' });
// calm() leaves a 1 ms transition on every property, so a read right after a change can still see the old value
const width = async (page: Page) => Math.round((await sidebar(page).boundingBox())!.width);
const widthIs = (page: Page, px: number) => expect.poll(() => width(page)).toBe(px);

test('Scenario: Collapsed sidebar stays collapsed after reload', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	await widthIs(page, 264);

	await sidebar(page).getByRole('button', { name: 'Collapse sidebar' }).click();
	await widthIs(page, 64);
	await expect(sidebar(page).getByRole('heading', { name: 'Folders' })).toBeHidden();
	await expect(sidebar(page).getByRole('link', { name: 'Home' })).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await widthIs(page, 64);

	await sidebar(page).getByRole('button', { name: 'Expand sidebar' }).click();
	await widthIs(page, 264);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await widthIs(page, 264);
	await expect(sidebar(page).getByRole('heading', { name: 'Folders' })).toBeVisible();
});

test('The content keeps clear of the rail', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const left = () => page.locator('main').evaluate((el) => el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft));
	const wide = await left();

	await sidebar(page).getByRole('button', { name: 'Collapse sidebar' }).click();
	await expect.poll(left).toBeLessThan(wide);
	expect(await left()).toBeGreaterThanOrEqual(64 + 16);
});
