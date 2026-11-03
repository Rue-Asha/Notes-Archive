import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });
const input = (page: Page) => palette(page).getByRole('combobox', { name: 'Search notes' });

test('Scenario: Cmd or Ctrl+K opens the palette anywhere', async ({ page, request }) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [{ title: 'Kyoto', body: 'Tempel am Morgen', folder: 0 }]
	});
	await calm(page);

	for (const path of ['/', `/folders/${folders[0]}`]) {
		await open(page, path);
		await page.keyboard.press('ControlOrMeta+k');
		await expect(palette(page)).toBeVisible();
		await expect(input(page)).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(palette(page)).toHaveCount(0);
	}

	await open(page, `/notes/${notes[0]}`);
	await page.locator('[data-editor-root] .ProseMirror').click();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(palette(page)).toBeVisible();
	await expect(input(page)).toBeFocused();
});

test('Scenario: Search buttons open the palette', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const nav = page.getByRole('navigation', { name: info.project.name === 'desktop' ? 'Sidebar' : 'Bottom bar' });
	await nav.getByRole('button', { name: /Search/ }).click();
	await expect(palette(page)).toBeVisible();
	await expect(input(page)).toBeFocused();
});

test('Scenario: Empty palette shows recent notes', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: Array.from({ length: 10 }, (_, i) => ({
			title: `Notiz ${i + 1}`,
			body: `Inhalt ${i + 1}`,
			updatedAt: `2026-10-${String(i + 10).padStart(2, '0')}T10:00:00.000Z`
		}))
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');

	const recent = palette(page).getByRole('group', { name: 'Recent' });
	await expect(recent.getByRole('option')).toHaveCount(8);
	await expect(recent.getByRole('option').first()).toContainText('Notiz 10');
	await expect(recent.getByRole('option').last()).toContainText('Notiz 3');
	await expect(recent).toContainText('Recent');
});

test('Scenario: Palette is full-screen on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the full-screen sheet is the phone layout');
	await reset(request);
	await calm(page);
	await open(page, '/');
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Search' }).click();
	await expect(palette(page)).toBeVisible();
	const box = (await palette(page).boundingBox())!;
	const view = page.viewportSize()!;
	expect(box.x).toBeCloseTo(0, 0);
	expect(box.y).toBeCloseTo(0, 0);
	expect(box.width).toBeCloseTo(view.width, 0);
	expect(box.height).toBeCloseTo(view.height, 0);
});
