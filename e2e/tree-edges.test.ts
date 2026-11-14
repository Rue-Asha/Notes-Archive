import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function treeScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

test('Scenario: Empty tree offers New folder', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await expect(tree.getByText('No folders yet')).toBeVisible();
	await expect(tree.getByRole('button', { name: 'New folder' })).toBeVisible();
});

test('Scenario: Long names truncate with a tooltip', async ({ page, request }, info) => {
	const name = 'Eine sehr lange Ordnerbezeichnung die garantiert nicht in die schmale Seitenleiste passt';
	await reset(request);
	await seed(request, { folders: [{ name }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const row = tree.getByRole('link', { name, exact: true });
	await expect(row).toHaveAttribute('title', name);
	const label = row.getByText(name, { exact: true });
	expect(await label.evaluate((el) => getComputedStyle(el).textOverflow)).toBe('ellipsis');
	expect(await label.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
	expect((await row.boundingBox())!.height).toBeLessThan(48);
});

test('Scenario: Deep nesting caps the indent', async ({ page, request }, info) => {
	const names = Array.from({ length: 10 }, (_, i) => `Ebene ${i + 1}`);
	await reset(request);
	const { folders } = await seed(request, { folders: names.map((name, i) => (i === 0 ? { name } : { name, parent: i - 1 })) });
	await calm(page);
	await open(page, `/folders/${folders[9]}`);
	const tree = await treeScope(page, info);

	const xs: number[] = [];
	for (const name of names) {
		const link = tree.getByRole('link', { name, exact: true });
		await expect(link).toBeVisible();
		xs.push((await link.boundingBox())!.x);
	}
	for (let i = 1; i < 6; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
	for (let i = 6; i < 10; i++) expect(xs[i]).toBe(xs[5]);
});

test('Scenario: Choosing a tree item closes the drawer', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the drawer only exists below 1024 px');
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste', folder: 0 }] });
	await calm(page);
	await open(page, '/');
	const drawer = await treeScope(page, info);

	await drawer.getByRole('button', { name: 'Expand Reisen' }).click();
	await drawer.getByRole('link', { name: 'Packliste', exact: true }).click();
	await page.waitForURL(`**/notes/${notes[0]}`);
	await expect(drawer).toBeHidden();
});

test('Scenario: A multi-line title shows on one line in the tree', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Reise\n\nPlan' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const link = tree.getByRole('link', { name: 'Reise Plan', exact: true });
	await expect(link).toBeVisible();
	await expect(link).toHaveAttribute('title', 'Reise Plan');
});
