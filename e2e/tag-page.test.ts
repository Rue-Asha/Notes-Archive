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
