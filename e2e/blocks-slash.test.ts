import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

test('Scenario: Slash menu inserts toggle, callout and table', async ({ page, request }) => {
	await reset(request);
	const empty: JSONContent = { type: 'paragraph' };
	const { notes } = await seed(request, { notes: [{ title: 'Bausteine', content: { type: 'doc', content: [empty, empty, empty] } }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	// the table goes last: its menu sits above it and would cover the paragraph before
	// the callout holds a paragraph of its own, so the third block's target is the second visible paragraph
	for (const [index, name, nth] of [
		[0, 'Toggle', 0],
		[1, 'Callout', 0],
		[2, 'Table', 1]
	] as const) {
		await editor(page).getByRole('paragraph').nth(nth).click();
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
