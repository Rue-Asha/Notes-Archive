import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

test('Scenario: Code block highlights syntax and switches language', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Quelltext', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	await page.keyboard.type('``` ');
	await page.keyboard.type('const a = 1');
	const code = editor(page).getByRole('code');
	await expect(code).toContainText('const a = 1');

	await editor(page).getByRole('combobox', { name: 'Language' }).selectOption({ label: 'TypeScript' });
	await expect(code.locator('.hljs-keyword', { hasText: 'const' })).toBeVisible();
	await expect(editor(page).getByRole('combobox', { name: 'Language' })).toHaveValue('typescript');

	await saves.settled();
	const node = (await storedNote(request, notes[0]))!.content.content![0];
	expect(node.type).toBe('codeBlock');
	expect(node.attrs?.language).toBe('typescript');
	expect(node.content![0].text).toBe('const a = 1');
});
