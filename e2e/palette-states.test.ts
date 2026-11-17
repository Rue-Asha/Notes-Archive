import { expect, test, type Page } from '@playwright/test';
import { bottomBar, calm, open, reset, seed } from './helpers.ts';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });
const input = (page: Page) => palette(page).getByRole('combobox', { name: 'Search notes' });

test('Scenario: Empty palette shows Recent and Actions', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: Array.from({ length: 5 }, (_, i) => ({
			title: `Notiz ${i + 1}`,
			body: `Inhalt ${i + 1}`,
			updatedAt: `2026-10-${String(i + 10).padStart(2, '0')}T10:00:00.000Z`
		}))
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');

	const recent = palette(page).getByRole('group', { name: 'Recent' });
	await expect(recent.getByRole('option')).toHaveCount(5);
	await expect(recent.getByRole('option').first()).toContainText('Notiz 5');
	await expect(recent.getByRole('option').last()).toContainText('Notiz 1');
	await expect(palette(page).getByRole('group', { name: 'Actions' }).getByRole('option')).toHaveText([/New note/, /New folder/]);
});

test('Scenario: Typing shows at most eight highlighted hits', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: Array.from({ length: 12 }, (_, i) => ({ title: `Kyoto Reise ${i + 1}`, body: `Tempel am Morgen ${i + 1}` }))
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('kyoto');

	const hits = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(hits).toHaveCount(8);
	for (let i = 0; i < 8; i++) {
		// <mark> has no ARIA role, so the highlight can only be found by tag
		await expect(hits.nth(i).locator('mark').first()).toHaveText('Kyoto');
	}
	await expect(palette(page).getByRole('option', { name: /See all results/ })).toHaveCount(1);
});

test('Scenario: Back closes the palette on touch', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the history entry is the touch posture');
	await reset(request);
	await calm(page);
	await open(page, '/');
	const url = page.url();
	await bottomBar(page).getByRole('button', { name: 'Search' }).click();
	await expect(palette(page)).toBeVisible();

	await page.goBack();
	await expect(palette(page)).toHaveCount(0);
	expect(page.url()).toBe(url);
});
