import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'phone', 'the bottom bar only exists below 1024 px');
});

test('Scenario: Phone bar shows three pills and New note', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const bar = page.getByRole('navigation', { name: 'Bottom bar' });
	await expect(bar).toBeVisible();
	await expect(bar.getByRole('link', { name: 'Home' })).toBeVisible();
	await expect(bar.getByRole('link', { name: 'Folders' })).toBeVisible();
	await expect(bar.getByRole('button', { name: 'Search' })).toBeVisible();
	await expect(bar.getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(bar.getByRole('button')).toHaveCount(2);
	await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeHidden();
});

test('Scenario: Current section is marked', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	const bar = page.getByRole('navigation', { name: 'Bottom bar' });
	const current = async () => bar.locator('[aria-current]').allInnerTexts();

	await open(page, '/');
	expect(await current()).toEqual(['Home']);
	await open(page, '/folders');
	expect(await current()).toEqual(['Folders']);
	await open(page, `/folders/${folders[0]}`);
	expect(await current()).toEqual(['Folders']);
	await open(page, '/search');
	expect(await current()).toEqual(['Search']);
});

test('Scenario: Bar hides while the editor has focus', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const bar = page.getByRole('navigation', { name: 'Bottom bar', includeHidden: true });
	await expect(bar).toBeVisible();
	await expect(bar).not.toHaveAttribute('aria-hidden', 'true');

	await page.getByLabel('Note body', { exact: true }).click();
	await expect(bar).toBeHidden();
	await expect(bar).toHaveAttribute('aria-hidden', 'true');
	await expect(bar).toHaveAttribute('inert', '');

	await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
	await expect(bar).toBeVisible();
	await expect(bar).not.toHaveAttribute('aria-hidden', 'true');
	await expect(bar).not.toHaveAttribute('inert', '');
	await bar.getByRole('link', { name: 'Home' }).focus();
	await expect(bar.getByRole('link', { name: 'Home' })).toBeFocused();
});

test('Scenario: Bar fits 320 px with safe areas', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await page.setViewportSize({ width: 320, height: 640 });
	await open(page, '/');

	const bar = page.getByRole('navigation', { name: 'Bottom bar' });
	const controls = [
		bar.getByRole('link', { name: 'Home' }),
		bar.getByRole('link', { name: 'Folders' }),
		bar.getByRole('button', { name: 'Search' }),
		bar.getByRole('button', { name: 'New note' })
	];
	const boxes = [];
	for (const c of controls) {
		await expect(c).toBeVisible();
		const box = (await c.boundingBox())!;
		expect(box.width).toBeGreaterThanOrEqual(24);
		expect(box.height).toBeGreaterThanOrEqual(24);
		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(320);
		expect(box.y + box.height).toBeLessThanOrEqual(640);
		boxes.push(box);
	}
	for (let i = 0; i < boxes.length; i++) {
		for (let j = i + 1; j < boxes.length; j++) {
			const a = boxes[i]!;
			const b = boxes[j]!;
			const apart = a.x + a.width <= b.x + 0.5 || b.x + b.width <= a.x + 0.5 || a.y + a.height <= b.y + 0.5 || b.y + b.height <= a.y + 0.5;
			expect(apart, `control ${i} overlaps control ${j}`).toBe(true);
		}
	}
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Scenario: New note from the sidebar or bottom bar opens a root note (bottom bar)', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))?.folderId).toBeNull();
});
