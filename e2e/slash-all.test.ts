import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { png } from './media-helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

const ITEMS: [label: string, type: string, attrs?: Record<string, unknown>][] = [
	['Text', 'paragraph'],
	['Heading 1', 'heading', { level: 1 }],
	['Heading 2', 'heading', { level: 2 }],
	['Heading 3', 'heading', { level: 3 }],
	['Bullet list', 'bulletList'],
	['Numbered list', 'orderedList'],
	['Task list', 'taskList'],
	['Quote', 'blockquote'],
	['Code', 'codeBlock'],
	['Divider', 'horizontalRule'],
	['Toggle', 'details'],
	['Callout', 'callout'],
	['Table', 'table'],
	['Image', 'image'],
	['File', 'fileCard']
];

test('Scenario: Slash menu lists every block type', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Alle Blöcke', body: '' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	await page.keyboard.type('/');

	await expect(menu(page).getByRole('option')).toHaveText(ITEMS.map(([label]) => new RegExp(`^\\s*\\S*\\s*${label}\\s*$`)));
});

for (const [label, type, attrs] of ITEMS) {
	test(`Slash menu inserts ${label}`, async ({ page, request }) => {
		await reset(request);
		const { notes } = await seed(request, { notes: [{ title: 'Alle Blöcke', body: '' }] });
		await calm(page);
		const saves = watchSaves(page);
		await open(page, `/notes/${notes[0]}`);
		await editor(page).click();

		await page.keyboard.type('/');
		const option = menu(page).getByRole('option', { name: label, exact: true });
		if (type === 'image' || type === 'fileCard') {
			const [chooser] = await Promise.all([page.waitForEvent('filechooser'), option.click()]);
			await chooser.setFiles(
				type === 'image'
					? { name: 'bild.png', mimeType: 'image/png', buffer: await png(32, 32) }
					: { name: 'datei.txt', mimeType: 'text/plain', buffer: Buffer.from('Hallo') }
			);
			await expect((type === 'image' ? editor(page).getByRole('figure').getByRole('presentation') : editor(page).getByRole('link'))).toBeVisible();
		} else {
			await option.click();
		}

		await expect(menu(page)).toBeHidden();
		await expect(editor(page)).not.toContainText('/');
		await saves.settled();
		const blocks = (await storedNote(request, notes[0]))!.content.content ?? [];
		const found = blocks.find((b) => b.type === type);
		expect(found, blocks.map((b) => b.type).join()).toBeTruthy();
		if (attrs) expect(found!.attrs).toMatchObject(attrs);
	});
}
