import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

test('Scenario: Slash menu inserts toggle, callout and table', async ({ page, request }) => {
	await reset(request);
	const empty: JSONContent = { type: 'paragraph' };
	const { notes } = await seed(request, { notes: [{ title: 'Bausteine', content: { type: 'doc', content: [empty, empty, empty] } }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	// the table goes last: its menu sits above it and would cover the paragraph before
	for (const [index, name] of [
		[0, 'Toggle'],
		[1, 'Callout'],
		[2, 'Table']
	] as const) {
		await body(page).locator(':scope > p').first().click();
		// ProseMirror reads the click's selection a tick later
		await page.waitForFunction((at) => (document.querySelector('.ProseMirror') as any).editor.state.selection.$from.index(0) === at, index);
		await page.keyboard.type('/' + name.toLowerCase());
		await menu(page).getByRole('option', { name, exact: true }).click();
		await expect(menu(page)).toBeHidden();
	}

	await saves.settled();
	const blocks = (await storedNote(request, notes[0]))!.content.content!.filter((b) => b.type !== 'paragraph');
	expect(blocks.map((b) => b.type)).toEqual(['details', 'callout', 'table'] as string[]);
	expect(blocks[0].content?.map((c) => c.type)).toEqual(['detailsSummary', 'detailsContent']);
	expect(blocks[0].attrs?.open).toBeUndefined();
	expect(blocks[1].attrs?.emoji).toBe('💡');
	const rows = blocks[2].content!;
	expect(rows.map((row) => row.content!.length)).toEqual([3, 3, 3]);
	expect(rows[0].content!.every((cell) => cell.type === 'tableHeader')).toBe(true);
	expect(rows[1].content!.every((cell) => cell.type === 'tableCell')).toBe(true);
});
