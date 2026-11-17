import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, treeScope } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

test('Scenario: Tag page lists its notes by last edited', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [
			{ title: 'Ältere', body: 'a', tags: ['Reise'], updatedAt: ago(8) },
			{ title: 'Neueste', body: 'b', folder: 0, tags: ['Reise'], updatedAt: ago(1) },
			{ title: 'Mittlere', body: 'c', tags: ['Reise', 'Arbeit'], updatedAt: ago(3) },
			{ title: 'Fremd', body: 'd', tags: ['Arbeit'], updatedAt: ago(0) }
		]
	});
	await calm(page);
	await open(page, '/');
	const scope = await treeScope(page, info);
	await scope.getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ }).click();

	await expect(page).toHaveURL(/\/tags\/\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Reise' })).toBeVisible();
	await expect(page.getByRole('article').getByRole('heading')).toHaveText(['Neueste', 'Mittlere', 'Ältere']);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

async function openFirstTag(page: Page, info: { project: { name: string } }) {
	await open(page, '/');
	const scope = await treeScope(page, info);
	await scope.getByRole('region', { name: 'Tags' }).getByRole('link').first().click();
	await expect(page).toHaveURL(/\/tags\/\d+$/);
}

test('Scenario: Tag page shows the tag heading and its notes', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		notes: [
			{ title: 'Alt', body: 'a', tags: ['Übung'], updatedAt: ago(5) },
			{ title: 'Neu', body: 'b', tags: ['Übung'], updatedAt: ago(1) },
			{ title: 'Mitte', body: 'c', tags: ['Übung'], updatedAt: ago(3) }
		]
	});
	await calm(page);
	await openFirstTag(page, info);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Übung');
	await expect(page.getByRole('main').getByRole('article').getByRole('heading')).toHaveText(['Neu', 'Mitte', 'Alt']);
	await expect(page.getByRole('main').getByText('3 notes')).toBeVisible();
});

test('Scenario: Tag page entries show folder, date and tags', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Kyoto', body: 'a', folder: 0, tags: ['Übung', 'Saat'], updatedAt: '2025-03-03T10:00:00.000Z' }] });
	await calm(page);
	await openFirstTag(page, info);

	await expect(page.getByRole('main').locator('.lede')).toHaveText('1 note, newest edited first.');
	const entry = page.getByRole('main').getByRole('article');
	const folder = entry.locator('[data-card-folder]');
	await expect(folder).toHaveText('Reisen');
	await expect(folder.locator('svg')).toHaveCount(1);
	const date = entry.locator('[data-card-time]');
	await expect(date).toHaveText('Mon 3 Mar 2025');
	await expect(entry.locator('[data-card-tag]')).toHaveText(['Übung', 'Saat']);
	// the folder sits on a line of its own, the date and the tags below it
	const [f, d] = [(await folder.boundingBox())!, (await date.boundingBox())!];
	expect(d.y).toBeGreaterThanOrEqual(f.y + f.height - 1);
});

test('Scenario: Long tag name heading wraps', async ({ page, request }, info) => {
	const unbroken = 'U'.repeat(60);
	const wide = page.viewportSize()!;
	for (const name of ['lang '.repeat(24).trim(), unbroken]) {
		await page.setViewportSize(wide);
		await reset(request);
		await seed(request, { notes: [{ title: 'Eins', body: 'a', tags: [name] }] });
		await calm(page);
		await openFirstTag(page, info);
		await page.setViewportSize({ width: 320, height: 800 });

		const heading = page.getByRole('heading', { level: 1 });
		await expect(heading).toBeVisible();
		expect(await heading.evaluate((el) => el.getBoundingClientRect().right <= document.documentElement.clientWidth)).toBe(true);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
	}
});

test('Scenario: Long tag pill wraps inside its entry', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Beete', body: 'Kompost', tags: ['a-very-long-tag-name-for-gardening', 'U'.repeat(40), 'Saat'] }] });
	await calm(page);
	await openFirstTag(page, info);
	await page.setViewportSize({ width: 375, height: 800 });
	await page.reload();

	for (const where of ['tag page', 'search']) {
		if (where === 'search') await open(page, '/search?q=Beete');
		const entry = page.getByRole('article').filter({ hasText: 'Beete' });
		await expect(entry.locator('[data-card-tag]')).toHaveCount(3);
		const right = (await entry.boundingBox())!;
		for (const pill of await entry.locator('[data-card-tag]').all()) {
			const box = (await pill.boundingBox())!;
			expect(box.x + box.width, `${where}: ${await pill.textContent()}`).toBeLessThanOrEqual(right.x + right.width);
		}
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), where).toBe(true);
	}
});

test('Scenario: One tagged note reads singular', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', body: 'a', tags: ['Reise'] }] });
	await calm(page);
	await openFirstTag(page, info);

	await expect(page.getByRole('main').getByText('1 note', { exact: true })).toBeVisible();
	await expect(page.getByRole('main').getByText('1 notes')).toHaveCount(0);
});

test('Unknown tag is a 404', async ({ request }) => {
	await reset(request);
	expect((await request.get('/tags/9999')).status()).toBe(404);
	expect((await request.get('/tags/abc')).status()).toBe(404);
});

async function openTag(page: Page, info: { project: { name: string } }) {
	await open(page, '/');
	const scope = await treeScope(page, info);
	await scope.getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ }).click();
	await expect(page).toHaveURL(/\/tags\/\d+$/);
}

async function deleteFirstCard(page: Page) {
	await page.getByRole('article').first().getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /^Delete “/ }).getByRole('button', { name: 'Delete' }).click();
}

test('Scenario: Deleting the last tagged note goes Home', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', body: 'a', tags: ['Reise'] }] });
	await calm(page);
	await openTag(page, info);
	await expect(page.getByRole('article')).toHaveCount(1);

	await deleteFirstCard(page);

	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText('Tag not found')).toHaveCount(0);
	const scope = await treeScope(page, info);
	await expect(scope.getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ })).toHaveCount(0);
});

test('Scenario: Deleting one of several tagged notes stays', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		notes: [
			{ title: 'Eins', body: 'a', tags: ['Reise'] },
			{ title: 'Zwei', body: 'b', tags: ['Reise'] }
		]
	});
	await calm(page);
	await openTag(page, info);
	await expect(page.getByRole('article')).toHaveCount(2);

	await deleteFirstCard(page);

	await expect(page.getByRole('article')).toHaveCount(1);
	await expect(page).toHaveURL(/\/tags\/\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Reise' })).toBeVisible();
});

test('Scenario: Unknown tag id is a plain 404', async ({ request }) => {
	await reset(request);
	const res = await request.get('/tags/999999', { maxRedirects: 0 });
	expect(res.status()).toBe(404);
	expect(await res.text()).toContain('Tag not found');
});
