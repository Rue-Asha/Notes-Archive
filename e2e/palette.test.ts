import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed } from './helpers.ts';

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
	await editor(page).click();
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

test('Scenario: Opening the palette leaves the page where it was', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the dock Search, at 390 and at 768 wide');
	await reset(request);
	await seed(request, { notes: Array.from({ length: 12 }, (_, i) => ({ title: `Notiz ${i + 1}`, body: 'Ein Absatz, der die Karte etwas höher macht.' })) });
	await calm(page);

	for (const width of [390, 768]) {
		await page.setViewportSize({ width, height: 844 });
		await open(page, '/');
		await page.evaluate(() => scrollTo(0, 300));
		await expect.poll(() => page.evaluate(() => scrollY)).toBe(300);

		// a tap where the dock's Search sits (a locator click would first scroll the sticky dock "into view")
		const search = (await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: /Search/ }).boundingBox())!;
		await page.touchscreen.tap(search.x + search.width / 2, search.y + search.height / 2);
		await expect(input(page)).toBeFocused();
		expect(await page.evaluate(() => scrollY), `${width}: open`).toBe(300);
		// the page behind does not scroll while the palette is open
		await page.mouse.wheel(0, 400);
		expect(await page.evaluate(() => scrollY), `${width}: wheel behind the palette`).toBe(300);

		await page.keyboard.press('Escape');
		await expect(palette(page)).toHaveCount(0);
		expect(await page.evaluate(() => scrollY), `${width}: closed`).toBe(300);
	}
});

test('Turning the window phone-sized leaves the page where it was', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'starts at 1280 wide');
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Lang' }],
		notes: Array.from({ length: 30 }, (_, i) => ({ title: `Notiz ${i + 1}`, body: 'Ein Absatz, der die Karte etwas höher macht.', folder: 0 }))
	});
	await calm(page);
	await page.setViewportSize({ width: 1280, height: 800 });
	await open(page, `/folders/${folders[0]}`);
	await page.evaluate(() => scrollTo(0, 600));
	await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);

	// the palette mounts its phone sheet closed at this width, and a closed sheet has no scroll to put back
	await page.setViewportSize({ width: 390, height: 800 });
	await expect(page.getByRole('navigation', { name: 'Bottom bar' })).toBeVisible();
	expect(await page.evaluate(() => scrollY)).toBe(600);
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
