import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });
const input = (page: Page) => palette(page).getByRole('combobox', { name: 'Search notes' });

test('Scenario: Typing shows results with highlighted snippets', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: [
			{ title: 'Tulpenbeet', body: 'Im Garten blühen Tulpen' },
			{ title: 'Einkauf', body: 'Brot und Milch' }
		]
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('garten');

	const results = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(results).toHaveCount(1);
	await expect(results.first()).toContainText('Tulpenbeet');
	await expect(results.first().locator('mark')).toHaveText('Garten');
	await expect(palette(page).getByRole('group', { name: 'Recent' })).toHaveCount(0);
});

test('Scenario: No hits shows No notes match', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Tulpenbeet', body: 'Im Garten' }] });
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('zzzz');

	await expect(palette(page)).toContainText('No notes match “zzzz”');
	await expect(palette(page).getByRole('group', { name: 'Notes' })).toHaveCount(0);
});

test('Scenario: Arrow keys and Enter open a result', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [
			{ title: 'Reise Lissabon', body: 'Alfama' },
			{ title: 'Reise Kyoto', body: 'Tempel' },
			{ title: 'Reiseapotheke', body: 'Pflaster' },
			{ title: 'Einkauf', body: 'Brot' }
		]
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('reise');

	const results = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(results).toHaveCount(3);
	await expect(results.nth(0)).toHaveAttribute('aria-selected', 'true');
	const third = await results.nth(2).getAttribute('href');
	expect(notes.map((id) => `/notes/${id}`)).toContain(third);

	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(results.nth(2)).toHaveAttribute('aria-selected', 'true');
	await expect(results.nth(0)).toHaveAttribute('aria-selected', 'false');
	await page.keyboard.press('Enter');

	await expect(page).toHaveURL((url) => url.pathname === third);
	await expect(palette(page)).toHaveCount(0);
});

test('Scenario: Escape closes the palette', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const nav = page.getByRole('navigation', { name: info.project.name === 'desktop' ? 'Sidebar' : 'Bottom bar' });
	const button = nav.getByRole('button', { name: /Search/ });
	await button.focus();
	await page.keyboard.press('Enter');
	await expect(palette(page)).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(palette(page)).toHaveCount(0);
	await expect(button).toBeFocused();
});
