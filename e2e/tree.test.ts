import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function treeScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

test('Scenario: Tree shows folders with their sub-folders and notes', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [
			{ title: 'Packliste', folder: 0 },
			{ title: 'Visa', folder: 0 }
		]
	});
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const reisen = tree.getByRole('link', { name: 'Reisen', exact: true });
	await expect(reisen).toBeVisible();
	await expect(tree.getByRole('link', { name: 'Japan', exact: true })).toBeHidden();

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	const japan = tree.getByRole('link', { name: 'Japan', exact: true });
	const packliste = tree.getByRole('link', { name: 'Packliste', exact: true });
	await expect(japan).toBeVisible();
	await expect(packliste).toBeVisible();
	await expect(tree.getByRole('link', { name: 'Visa', exact: true })).toBeVisible();
	const parent = (await reisen.boundingBox())!;
	expect((await japan.boundingBox())!.x).toBeGreaterThan(parent.x);
	expect((await packliste.boundingBox())!.x).toBeGreaterThan(parent.x);

	await tree.getByRole('button', { name: 'Collapse Reisen' }).click();
	await expect(japan).toBeHidden();
	await expect(packliste).toBeHidden();
});

test('Scenario: Current item is highlighted in the tree', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [{ title: 'Tempel', folder: 2 }, { title: 'Daneben', folder: 2 }]
	});
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	const tree = await treeScope(page, info);

	const current = tree.getByRole('link', { name: 'Tempel', exact: true });
	await expect(current).toHaveAttribute('aria-current', 'page');
	await expect(tree.getByRole('link', { name: 'Daneben', exact: true })).not.toHaveAttribute('aria-current', 'page');
	for (const name of ['Reisen', 'Japan', 'Kyoto']) await expect(tree.getByRole('link', { name, exact: true })).toBeVisible();
});

test('Scenario: Untitled note in the tree reads Untitled', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ folder: 0 }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	await expect(tree.getByRole('link', { name: 'Untitled', exact: true })).toBeVisible();
});
