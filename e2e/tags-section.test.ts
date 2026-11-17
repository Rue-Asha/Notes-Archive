import { expect, test, type Page } from '@playwright/test';
import { calm, isDesktop, open, reset, seed, treeScope } from './helpers.ts';

// the phone folds the properties into one line
async function expandProps(page: Page) {
	const summary = page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: /^Properties/ });
	if (await summary.count()) await summary.click();
}

test('Scenario: Tags sit below the tree with counts', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Orte' }], notes: [{ title: 'A', tags: ['Übung', 'Reise'] }, { title: 'B', tags: ['Übung'] }] });
	await calm(page);
	await open(page, '/');
	const scope = await treeScope(page, info);

	await expect(scope.getByRole('heading', { name: 'Tags' })).toBeVisible();
	const uebung = scope.getByRole('link', { name: /Übung/ });
	const reise = scope.getByRole('link', { name: /Reise/ });
	await expect(uebung).toContainText('2');
	await expect(reise).toContainText('1');
	expect(await uebung.getAttribute('href')).toMatch(/^\/tags\/\d+$/);
	expect(await reise.getAttribute('href')).toMatch(/^\/tags\/\d+$/);
	if (info.project.name === 'desktop') {
		const tree = (await scope.getByRole('tree', { name: 'Folders' }).boundingBox())!;
		expect((await uebung.boundingBox())!.y).toBeGreaterThan(tree.y + tree.height - 1);
	}
});

test('Scenario: The open tag is the current row', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'the sidebar list');
	await reset(request);
	await seed(request, { notes: [{ title: 'A', tags: ['Übung', 'Reise'] }, { title: 'B', tags: ['Übung'] }] });
	await calm(page);
	await open(page, '/');
	const tags = page.getByRole('navigation', { name: 'Sidebar' }).getByRole('region', { name: 'Tags' });
	await tags.getByRole('link', { name: /Übung/ }).click();
	await page.waitForURL(/\/tags\/\d+$/);

	const current = tags.locator('a[aria-current="page"]');
	await expect(current).toHaveCount(1);
	await expect(current.locator('.name')).toHaveText('Übung');
	await expect(current.locator('.count')).toHaveText('2');
	await expect(tags.getByRole('link', { name: /Reise/ })).not.toHaveAttribute('aria-current', 'page');
});

test('Scenario: Tags section is absent without tags', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'A' }] });
	await calm(page);
	await open(page, '/');
	const scope = await treeScope(page, info);

	if (isDesktop(info)) await expect(scope.getByRole('heading', { name: 'Folders' })).toBeVisible();
	else await expect(scope.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(scope.getByRole('heading', { name: 'Tags' })).toHaveCount(0);
});

test('Scenario: Tag counts update without reload', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar stays on screen next to the note');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'A', body: 'x', tags: ['Reise'] }, { title: 'B', body: 'y' }] });
	await calm(page);
	await open(page, `/notes/${notes[1]}`);
	await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));
	const reise = page.getByRole('navigation', { name: 'Sidebar' }).getByRole('link', { name: /Reise/ });
	await expect(reise).toContainText('1');

	await expandProps(page);
	const input = page.getByRole('group', { name: 'Properties' }).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('Reise');
	await input.press('Enter');

	await expect(reise).toContainText('2');
	expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
});

test('A tag link opens its tag page', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'A', tags: ['Reise'] }] });
	await calm(page);
	await open(page, '/');
	const scope = await treeScope(page, info);

	await scope.getByRole('link', { name: /Reise/ }).click();
	await page.waitForURL(/\/tags\/\d+$/);
	await expect(page.getByRole('dialog')).toHaveCount(0);
});
