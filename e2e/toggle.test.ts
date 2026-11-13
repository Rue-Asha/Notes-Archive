import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });
const text = (value: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text: value }] });
const details = (summary: string, content: JSONContent[]): JSONContent => ({
	type: 'details',
	content: [{ type: 'detailsSummary', content: [{ type: 'text', text: summary }] }, { type: 'detailsContent', content }]
});
const item = (value: string): JSONContent => ({ type: 'listItem', content: [text(value)] });

test("Scenario: Toggle opens and closes and doesn't save its state", async ({ page, request }) => {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [details('Mehr dazu', [text('Versteckter Satz')])] };
	const { notes } = await seed(request, { notes: [{ title: 'Klappe', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	const toggle = editor(page).locator('[data-type="details"]');
	// the toggle's own button is unnamed and the first button in the details node; nested content has none before it
	const button = toggle.getByRole('button').first();
	const hidden = editor(page).getByText('Versteckter Satz');

	await expect(hidden).toBeHidden();
	await button.click();
	await expect(hidden).toBeVisible();
	await button.click();
	await expect(hidden).toBeHidden();
	await button.click();
	await expect(hidden).toBeVisible();

	await saves.settled();
	expect(JSON.stringify((await storedNote(request, notes[0]))!.content)).not.toContain('"open"');
	await page.reload();
	await expect(editor(page).getByText('Mehr dazu')).toBeVisible();
	await expect(editor(page).getByText('Versteckter Satz')).toBeHidden();
	await editor(page).locator('[data-type="details"]').getByRole('button').first().click();
	await expect(editor(page).getByText('Versteckter Satz')).toBeVisible();
});

test('Scenario: Nested lists and toggles inside toggles work', async ({ page, request }) => {
	await reset(request);
	const content: JSONContent = {
		type: 'doc',
		content: [details('Außen', [{ type: 'bulletList', content: [item('Eins'), item('Zwei')] }, { type: 'paragraph' }])]
	};
	const { notes } = await seed(request, { notes: [{ title: 'Verschachtelt', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await editor(page).locator('[data-type="details"]').getByRole('button').first().click();
	const caretIn = (value: string) =>
		// ProseMirror reads the click's selection a tick later
		page.waitForFunction((v) => (document.querySelector('.ProseMirror') as any).editor.state.selection.$from.parent.textContent === v, value);
	await editor(page).getByText('Zwei', { exact: true }).click();
	await caretIn('Zwei');
	await page.keyboard.press('Tab');
	await editor(page).locator('[data-type="detailsContent"]').getByRole('paragraph').last().click();
	await caretIn('');
	await page.keyboard.type('/toggle');
	await menu(page).getByRole('option', { name: 'Toggle', exact: true }).click();
	await page.keyboard.type('Innen');

	await saves.settled();
	const outer = (await storedNote(request, notes[0]))!.content.content![0];
	const inner = outer.content![1].content!;
	expect(inner.map((n) => n.type)).toEqual(['bulletList', 'details']);
	const first = inner[0].content![0];
	expect(first.content!.map((n) => n.type)).toEqual(['paragraph', 'bulletList']);
	expect(first.content![1].content![0].content![0].content![0].text).toBe('Zwei');
	expect(inner[1].content![0].content![0].text).toBe('Innen');
});

test('Scenario: Dragging a toggle moves its content', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'drag is desktop only');
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [details('Block', [text('Erste Zeile'), text('Zweite Zeile')]), text('Eins'), text('Zwei')] };
	const { notes } = await seed(request, { notes: [{ title: 'Ziehen', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	const handle = page.getByRole('button', { name: 'Block actions' });

	await editor(page).getByText('Block', { exact: true }).hover();
	await expect(handle).toBeVisible();
	const grip = (await handle.boundingBox())!;
	const last = (await editor(page).getByText('Zwei', { exact: true }).boundingBox())!;
	await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
	await page.mouse.down();
	await page.mouse.move(last.x + last.width - 1, last.y + last.height / 2, { steps: 15 });
	// allow-listed hook, see docs/functional-contract.md section 9
	await expect(page.locator('.prosemirror-dropcursor-block')).toBeVisible();
	await page.mouse.up();

	await saves.settled();
	// the editor keeps an empty paragraph after a final non-paragraph block
	const blocks = (await storedNote(request, notes[0]))!.content.content!.filter((b) => b.type !== 'paragraph' || b.content);
	expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'paragraph', 'details']);
	const moved = blocks[2].content![1].content!;
	expect(moved.map((p) => p.content![0].text)).toEqual(['Erste Zeile', 'Zweite Zeile']);
});
