import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

test('Scenario: Task checkbox persists after reload', async ({ page, request }) => {
	await reset(request);
	const task = (value: string): JSONContent => ({
		type: 'taskItem',
		attrs: { checked: false },
		content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }]
	});
	const content: JSONContent = { type: 'doc', content: [{ type: 'taskList', content: [task('Milch kaufen'), task('Post holen')] }] };
	const { notes } = await seed(request, { notes: [{ title: 'Aufgaben', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const boxes = editor(page).getByRole('checkbox');
	await boxes.nth(1).check();
	await expect(boxes.nth(1)).toBeChecked();

	await saves.settled();
	const items = (await storedNote(request, notes[0]))!.content.content![0].content!;
	expect(items.map((i) => i.attrs?.checked)).toEqual([false, true]);
	await page.reload();
	await expect(editor(page).getByRole('checkbox')).toHaveCount(2);
	await expect(editor(page).getByRole('checkbox').nth(1)).toBeChecked();
	await expect(editor(page).getByRole('checkbox').nth(0)).not.toBeChecked();
});
