import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function tagsScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

test('Scenario: Sidebar lists tags with counts', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'A', tags: ['Übung', 'Reise'] }, { title: 'B', tags: ['Übung'] }] });
	await calm(page);
	await open(page, '/');
	const scope = await tagsScope(page, info);

	await expect(scope.getByRole('heading', { name: 'Tags' })).toBeVisible();
	const uebung = scope.getByRole('link', { name: /Übung/ });
	const reise = scope.getByRole('link', { name: /Reise/ });
	await expect(uebung).toContainText('2');
	await expect(reise).toContainText('1');
	expect(await uebung.getAttribute('href')).toMatch(/^\/tags\/\d+$/);
	expect(await reise.getAttribute('href')).toMatch(/^\/tags\/\d+$/);
});

test('Scenario: Tags section is hidden without tags', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'A' }] });
	await calm(page);
	await open(page, '/');
	const scope = await tagsScope(page, info);

	await expect(scope.getByRole('heading', { name: 'Folders' })).toBeVisible();
	await expect(scope.getByRole('heading', { name: 'Tags' })).toHaveCount(0);
});

test('A tag link opens its tag page and closes the drawer', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'A', tags: ['Reise'] }] });
	await calm(page);
	await open(page, '/');
	const scope = await tagsScope(page, info);

	await scope.getByRole('link', { name: /Reise/ }).click();
	await page.waitForURL(/\/tags\/\d+$/);
	await expect(page.getByRole('dialog', { name: 'Folders' })).toBeHidden();
});
