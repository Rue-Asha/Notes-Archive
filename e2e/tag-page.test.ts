import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

// the sidebar on desktop, the drawer on phone
async function tagsScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

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
	const scope = await tagsScope(page, info);
	await scope.getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ }).click();

	await expect(page).toHaveURL(/\/tags\/\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Reise' })).toBeVisible();
	await expect(page.getByRole('article').getByRole('heading')).toHaveText(['Neueste', 'Mittlere', 'Ältere']);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Unknown tag is a 404', async ({ request }) => {
	await reset(request);
	expect((await request.get('/tags/9999')).status()).toBe(404);
	expect((await request.get('/tags/abc')).status()).toBe(404);
});

async function openTag(page: Page, info: { project: { name: string } }) {
	await open(page, '/');
	const scope = await tagsScope(page, info);
	await scope.getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ }).click();
	await expect(page).toHaveURL(/\/tags\/\d+$/);
}

async function deleteFirstCard(page: Page) {
	await page.getByRole('article').first().getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('dialog', { name: 'Delete note' }).getByRole('button', { name: 'Delete' }).click();
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
	const scope = await tagsScope(page, info);
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
