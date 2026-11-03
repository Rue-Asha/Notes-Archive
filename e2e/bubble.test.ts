import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Format' });

function nodes(doc: JSONContent): JSONContent[] {
	return [doc, ...(doc.content ?? []).flatMap(nodes)];
}

const selected = (page: Page) => page.evaluate(() => getSelection()?.toString());

async function openNote(page: Page, request: Parameters<typeof reset>[0], content?: JSONContent) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Auswahl', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	return { id: notes[0], saves };
}

const paragraph = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const doc = (...content: JSONContent[]): JSONContent => ({ type: 'doc', content });

test('Scenario: Selecting text shows the bubble toolbar', async ({ page, request }) => {
	await openNote(page, request, doc(paragraph('Hallo Welt')));
	await expect(toolbar(page)).toBeHidden();

	await body(page).getByText('Hallo Welt').dblclick({ position: { x: 5, y: 8 } });
	await expect.poll(() => selected(page)).toContain('Hallo');

	await expect(toolbar(page)).toBeVisible();
	for (const name of ['Bold', 'Italic', 'Strikethrough', 'Inline code', 'Link', 'Text colour'])
		await expect(toolbar(page).getByRole('button', { name })).toBeVisible();
});

test('Scenario: Bubble toolbar applies marks', async ({ page, request }) => {
	const { id, saves } = await openNote(page, request, doc(paragraph('Welt')));
	await body(page).getByText('Welt').dblclick({ position: { x: 10, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	for (const name of ['Bold', 'Italic', 'Strikethrough', 'Inline code']) {
		const button = toolbar(page).getByRole('button', { name });
		await expect(button).toHaveAttribute('aria-pressed', 'false');
		await button.click();
		await expect(button).toHaveAttribute('aria-pressed', 'true');
	}

	await saves.settled();
	const { content } = (await storedNote(request, id))!;
	const text = nodes(content).find((n) => n.type === 'text')!;
	expect(text.text).toBe('Welt');
	expect(text.marks?.map((m) => m.type).sort()).toEqual(['bold', 'code', 'italic', 'strike']);
});

test('Scenario: Text colour from the palette', async ({ page, request }) => {
	const { id, saves } = await openNote(page, request, doc(paragraph('Welt')));
	await body(page).getByText('Welt').dblclick({ position: { x: 10, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	await toolbar(page).getByRole('button', { name: 'Text colour' }).click();
	await toolbar(page).getByRole('button', { name: 'clay' }).click();
	await expect(body(page).locator('[data-color="clay"]')).toHaveText('Welt');
	await saves.settled();
	const colored = nodes((await storedNote(request, id))!.content).find((n) => n.type === 'text')!;
	expect(colored.marks).toEqual([{ type: 'textStyle', attrs: { color: 'clay' } }]);

	await toolbar(page).getByRole('button', { name: 'Text colour' }).click();
	await toolbar(page).getByRole('button', { name: 'Default' }).click();
	await expect(body(page).locator('[data-color]')).toHaveCount(0);
	await saves.settled();
	const plain = nodes((await storedNote(request, id))!.content).find((n) => n.type === 'text')!;
	expect(plain.marks ?? []).toEqual([]);
});

test('Scenario: Bubble toolbar is hidden in code blocks', async ({ page, request }) => {
	await openNote(page, request, doc(
			{ type: 'codeBlock', content: [{ type: 'text', text: 'const wert' }] },
			// the toolbar floats over the block above or below the selection, so keep both out of its way
			paragraph('Eins'),
			paragraph('Zwei'),
			paragraph('Drei'),
			paragraph('Welt')
		));

	await body(page).getByText('Welt').dblclick({ position: { x: 10, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	await body(page).locator('pre').getByText('const wert').dblclick({ position: { x: 5, y: 8 } });
	await expect.poll(() => selected(page)).toContain('const');
	await expect(toolbar(page)).toBeHidden();
});

test('Scenario: On touch the toolbar sits below the selection', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch placement');
	await openNote(page, request, doc(paragraph('Hallo Welt')));

	await body(page).getByText('Hallo Welt').dblclick({ position: { x: 5, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	await expect
		.poll(async () => {
			const selection = await page.evaluate(() => getSelection()!.getRangeAt(0).getBoundingClientRect().bottom);
			return ((await toolbar(page).boundingBox())!.y) >= selection;
		})
		.toBe(true);
});

test('On touch the toolbar stays below a selection on the last visible line', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch placement');
	const lines = Array.from({ length: 40 }, (_, i) => paragraph(`Zeile ${i + 1} mit etwas Text`));
	await openNote(page, request, doc(...lines));
	await body(page).getByText('Zeile 3 mit').dblclick({ position: { x: 5, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	// the viewport ends right under the selection, as it does above the keyboard
	const bottom = await page.evaluate(() => getSelection()!.getRangeAt(0).getBoundingClientRect().bottom);
	await page.setViewportSize({ width: 390, height: Math.round(bottom + 12) });

	await page.waitForTimeout(400);
	const selection = await page.evaluate(() => getSelection()!.getRangeAt(0).getBoundingClientRect().bottom);
	expect((await toolbar(page).boundingBox())!.y).toBeGreaterThanOrEqual(selection);
});
