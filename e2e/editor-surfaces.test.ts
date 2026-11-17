import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const paragraph = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });

function nodes(doc: JSONContent): JSONContent[] {
	return [doc, ...(doc.content ?? []).flatMap(nodes)];
}

async function openDoc(page: Page, request: Parameters<typeof reset>[0], content: JSONContent) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Editor', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	return { id: notes[0], saves };
}

test('Scenario: Handle on touch targets the cursor\'s block', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch handle');
	await openDoc(page, request, { type: 'doc', content: [paragraph('Eins'), paragraph('Zwei'), paragraph('Drei')] });

	await editor(page).getByText('Drei').click();
	const handle = page.getByRole('button', { name: 'Block actions' });
	await expect(handle).toBeVisible();
	await handle.tap();

	const menu = page.getByRole('menu', { name: 'Block menu' });
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('menuitem', { name: 'Move down' })).toHaveAttribute('aria-disabled', 'true');
	await menu.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(editor(page).getByRole('paragraph')).toHaveText(['Eins', 'Zwei']);
});

test('Scenario: Long unbroken words wrap', async ({ page, request }) => {
	await openDoc(page, request, {
		type: 'doc',
		content: [paragraph('x'.repeat(300)), paragraph(`https://example.org/${'pfad/'.repeat(40)}datei.html?${'a=b&'.repeat(20)}`)]
	});
	await page.setViewportSize({ width: 320, height: 700 });

	const card = (await editor(page).boundingBox())!;
	for (const p of await editor(page).getByRole('paragraph').all()) {
		const box = (await p.boundingBox())!;
		expect(box.x + box.width).toBeLessThanOrEqual(card.x + card.width + 1);
		expect(await p.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
	}
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Scenario: Very long note stays usable', async ({ page, request }) => {
	const content: JSONContent = { type: 'doc', content: Array.from({ length: 600 }, (_, i) => paragraph(`Block ${i + 1}`)) };
	const { id, saves } = await openDoc(page, request, content);

	await expect(editor(page).locator(':scope > p')).toHaveCount(600);
	await editor(page).getByText('Block 1', { exact: true }).click();
	await page.keyboard.press('ControlOrMeta+End');
	await page.keyboard.type(' und Ende');

	await expect(page.locator('[data-save-state="saved"]')).toBeVisible();
	await saves.settled();
	const { content: stored } = (await storedNote(request, id))!;
	expect(stored.content).toHaveLength(600);
	expect(stored.content!.at(-1)!.content![0].text).toBe('Block 600 und Ende');
});

test('Scenario: Text colours keep their stored names', async ({ page, request }) => {
	const { id, saves } = await openDoc(page, request, { type: 'doc', content: [paragraph('Meer')] });

	await editor(page).getByText('Meer').dblclick({ position: { x: 10, y: 8 } });
	const toolbar = page.getByRole('toolbar', { name: 'Format' });
	await toolbar.getByRole('button', { name: 'Text colour' }).click();
	await toolbar.getByRole('button', { name: 'sea', exact: true }).click();
	await saves.settled();

	const { content } = (await storedNote(request, id))!;
	const marks = nodes(content).flatMap((n) => n.marks ?? []);
	expect(marks.find((m) => m.type === 'textStyle')?.attrs?.color).toBe('sea');

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	const span = editor(page).locator('span[data-color="sea"]');
	await expect(span).toHaveText('Meer');
	const [rendered, token] = await span.evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.color = 'var(--text-sea)';
		document.body.append(probe);
		const expected = getComputedStyle(probe).color;
		probe.remove();
		return [getComputedStyle(el).color, expected];
	});
	expect(token).not.toBe('');
	expect(rendered).toBe(token);
});

// Chrome delivers selectionchange as a queued task; a key pressed right after the caret moved used to split the first
// block instead, so each round opens the note fresh and presses Enter with no pause
test('Regression: Enter right after End splits at the caret', async ({ page, request }) => {
	// short enough to stay on one line on the phone, where End stops at the visual line end
	const text = 'Am Bahnhof.';
	for (let round = 0; round < 10; round++) {
		await openDoc(page, request, { type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Ankunft' }] }, paragraph(`Eins. ${text}`), paragraph(`Zwei. ${text}`)] });
		await editor(page).getByText('Eins.').click();
		await page.keyboard.press('End');
		await page.keyboard.press('Enter');
		await page.keyboard.type('Q');
		await expect(editor(page).locator('h2, p')).toHaveText(['Ankunft', `Eins. ${text}`, 'Q', `Zwei. ${text}`]);
	}
});
