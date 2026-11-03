import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');

test('Scenario: Code block highlights syntax and switches language', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Quelltext', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await body(page).click();

	await page.keyboard.type('``` ');
	await page.keyboard.type('const a = 1');
	const code = body(page).locator('pre code');
	await expect(code).toContainText('const a = 1');

	await body(page).locator('pre .code-language').selectOption({ label: 'TypeScript' });
	await expect(code.locator('.hljs-keyword', { hasText: 'const' })).toBeVisible();
	await expect(body(page).locator('pre .code-language')).toHaveValue('typescript');

	await saves.settled();
	const node = (await storedNote(request, notes[0]))!.content.content![0];
	expect(node.type).toBe('codeBlock');
	expect(node.attrs?.language).toBe('typescript');
	expect(node.content![0].text).toBe('const a = 1');
});
