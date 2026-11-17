import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote } from './helpers.ts';

const noteId = (page: Page) => Number(new URL(page.url()).pathname.split('/').pop());

async function paletteNewNote(page: Page) {
	await page.keyboard.press('ControlOrMeta+k');
	await page.getByRole('dialog', { name: 'Search' }).getByRole('group', { name: 'Actions' }).getByRole('option', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
}

test('Scenario: New note from the shell lands in the current folder', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewport to reach both the sidebar and the phone bar');
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan' }],
		notes: [{ title: 'Kyoto', body: 'Tempel', folder: 1 }]
	});
	await calm(page);
	await open(page, `/folders/${folders[1]}`);

	await page.getByRole('navigation', { name: 'Sidebar' }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	expect((await storedNote(request, noteId(page)))!.folderId).toBe(folders[1]);

	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, `/notes/${notes[0]}`);
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL((url) => /\/notes\/\d+$/.test(url.pathname) && url.pathname !== `/notes/${notes[0]}`);
	expect((await storedNote(request, noteId(page)))!.folderId).toBe(folders[1]);
});

test('Scenario: New note without a current folder lands at the top level', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar entry only exists from 1024 px');
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Japan' }],
		notes: [{ title: 'Kyoto', body: 'Tempel', folder: 0, tags: ['Reise'] }]
	});
	await calm(page);
	const tagPath = (await (await request.get('/')).text()).match(/href="(\/tags\/\d+)"/)?.[1];
	expect(tagPath).toBeDefined();
	const sidebar = page.getByRole('navigation', { name: 'Sidebar' });

	await open(page, '/');
	await sidebar.getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	expect((await storedNote(request, noteId(page)))!.folderId).toBeNull();

	await open(page, '/search');
	await sidebar.getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	expect((await storedNote(request, noteId(page)))!.folderId).toBeNull();

	await open(page, tagPath!);
	await paletteNewNote(page);
	expect((await storedNote(request, noteId(page)))!.folderId).toBeNull();
	expect(folders).toHaveLength(1);
});

test('Scenario: New note shows its placeholders', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await page.getByRole('main').getByRole('button', { name: 'New note' }).first().click();
	await page.waitForURL(/\/notes\/\d+$/);
	await expect(page.getByRole('textbox', { name: 'Title' })).toHaveAttribute('placeholder', 'Untitled');
	await expect(editor(page).locator('p.is-editor-empty')).toHaveAttribute('data-placeholder', 'Write, or type / for blocks');
});
