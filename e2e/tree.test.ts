import { expect, test } from '@playwright/test';
import { calm, isDesktop, open, reset, seed, treeScope } from './helpers.ts';

test('Scenario: Tree shows folders with their sub-folders and notes', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'the tree is the sidebar; the phone drills down (drill-down)');
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
	test.skip(!isDesktop(info), 'the tree is the sidebar; the phone drills down (drill-down)');
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
	// the tree focuses Kyoto: its ancestors sit in the path row
	for (const name of ['Reisen', 'Japan']) await expect(tree.getByRole('navigation', { name: 'Path' }).getByRole('link', { name })).toBeVisible();
	await expect(tree.getByRole('button', { name: 'Kyoto menu' })).toBeVisible();
});

test('Scenario: Untitled note in the tree reads Untitled', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'the tree is the sidebar; the phone drills down (drill-down)');
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ folder: 0 }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	await expect(tree.getByRole('link', { name: 'Untitled', exact: true })).toBeVisible();
});
