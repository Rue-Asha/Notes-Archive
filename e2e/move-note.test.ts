import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

// the phone folds the properties into one line
async function expandProps(page: Page) {
	const summary = page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: /^Properties/ });
	if (await summary.count()) await summary.click();
}

test('Scenario: Move a note from its properties row', async ({ page, request }, info) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan' }],
		notes: [{ title: 'Packliste', body: 'Zelt', folder: 0 }]
	});
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));

	await expandProps(page);
	const field = page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: 'Folder' });
	await expect(field).toContainText('Reisen');
	await field.click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Japan' }).click();

	await expect(field).toContainText('Japan');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.folderId).toBe(folders[1]);

	if (info.project.name === 'phone') {
		await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
		await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('link', { name: 'Folders' }).click();
		await page.getByRole('main').getByRole('list', { name: 'Folders' }).getByRole('link', { name: /Japan/ }).click();
		await expect(page.getByRole('main').getByRole('list', { name: 'Notes' }).getByRole('link', { name: /Packliste/ })).toBeVisible();
	} else {
		const tree = page.getByRole('navigation', { name: 'Sidebar' });
		const row = tree.getByRole('link', { name: 'Packliste', exact: true });
		await expect(row).toBeVisible();
		await expect(tree.getByRole('button', { name: 'Japan menu' })).toBeVisible();
		await expect(row).toHaveAttribute('aria-current', 'page');
		expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
	}
});

test('Scenario: Move a note to the root from its properties row', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste', body: 'Zelt', folder: 0 }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await expandProps(page);
	const field = page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: 'Folder' });
	await field.click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Root' }).click();
	await expect(field).toContainText('Root');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.folderId).toBeNull();
});

test('Scenario: Move a note from the note menu', async ({ page, request }) => {
	await reset(request);
	const { folders, notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste', body: 'Zelt' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Reisen' }).click();
	await expandProps(page);
	await expect(page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: 'Folder' })).toContainText('Reisen');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.folderId).toBe(folders[0]);
});
