import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

function nodes(doc: JSONContent): JSONContent[] {
	return [doc, ...(doc.content ?? []).flatMap(nodes)];
}

const ofType = (doc: JSONContent, type: string) => nodes(doc).filter((n) => n.type === type);

test('Scenario: Markdown shortcuts turn into blocks', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Kürzel' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	// Enter on an empty list item or quote line leaves the block, so the next shortcut starts on a plain line
	for (const [shortcut, exits] of [
		['# Eins', 1],
		['## Zwei', 1],
		['### Drei', 1],
		['- Strich', 2],
		['1. Zahl', 2],
		['* Stern', 2],
		['[] Aufgabe', 2],
		['> Zitat', 2],
		['---', 0]
	] as const) {
		await page.keyboard.type(shortcut);
		for (let i = 0; i < exits; i++) await page.keyboard.press('Enter');
	}
	await page.keyboard.type('``` code');

	await saves.settled();
	const { content } = (await storedNote(request, notes[0]))!;
	expect(ofType(content, 'heading').map((h) => h.attrs?.level)).toEqual([1, 2, 3]);
	expect(ofType(content, 'bulletList')).toHaveLength(2);
	expect(ofType(content, 'orderedList')).toHaveLength(1);
	expect(ofType(content, 'taskList')).toHaveLength(1);
	expect(ofType(content, 'blockquote')).toHaveLength(1);
	expect(ofType(content, 'horizontalRule')).toHaveLength(1);
	expect(ofType(content, 'codeBlock').map((c) => c.content?.[0]?.text)).toEqual(['code']);
});

test('Scenario: Keyboard marks and undo', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Marken', body: 'Wort' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).getByRole('paragraph').click();
	// the note holds only this word; Shift+Home would leave ProseMirror a tick behind the DOM selection
	await page.keyboard.press('ControlOrMeta+a');

	const p = editor(page).getByRole('paragraph');
	await page.keyboard.press('ControlOrMeta+b');
	await page.keyboard.press('ControlOrMeta+i');
	await page.keyboard.press('ControlOrMeta+e');
	for (const role of ['strong', 'emphasis', 'code'] as const) await expect(p.getByRole(role)).toHaveText('Wort');

	for (let i = 0; i < 3; i++) await page.keyboard.press('ControlOrMeta+z');
	await expect(p).toHaveText('Wort');
	await expect(p.getByRole('strong').or(p.getByRole('emphasis')).or(p.getByRole('code'))).toHaveCount(0);

	await page.keyboard.press('ControlOrMeta+Shift+z');
	await expect(p.getByRole('strong')).toHaveText('Wort');
	await expect(p.getByRole('emphasis').or(p.getByRole('code'))).toHaveCount(0);
});

test('Scenario: Shortcuts do not fire inside code blocks', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Code' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	await page.keyboard.type('``` ');
	await page.keyboard.type('# x');
	await page.keyboard.press('Enter');
	await page.keyboard.type('- y');

	await saves.settled();
	const { content } = (await storedNote(request, notes[0]))!;
	expect(ofType(content, 'codeBlock').map((c) => c.content?.[0]?.text)).toEqual(['# x\n- y']);
	expect(ofType(content, 'heading')).toHaveLength(0);
	expect(ofType(content, 'bulletList')).toHaveLength(0);
});

test('Scenario: Typing in the editor runs no animations', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Ruhig', icon: '🌿', body: 'Erste Zeile' }] });
	await open(page, `/notes/${notes[0]}`);
	await editor(page).getByRole('paragraph').click();
	await page.keyboard.press('End');

	await page.keyboard.type(' und ein ganzer Satz, der ruhig bleibt.');

	await expect(editor(page)).toContainText('der ruhig bleibt.');
	const running = await page.evaluate(() => {
		const scope = document.querySelector('main')!;
		return document
			.getAnimations()
			.map((a) => (a.effect as KeyframeEffect | null)?.target)
			.filter((t): t is Element => !!t && scope.contains(t))
			.map((t) => t.outerHTML.slice(0, 80));
	});
	expect(running).toEqual([]);
});

test('Scenario: Note column is capped and centred on wide screens', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'wide viewports run on desktop');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Breit', body: 'Ein Absatz. '.repeat(80) }] });
	await calm(page);
	await page.setViewportSize({ width: 1600, height: 900 });
	await open(page, `/notes/${notes[0]}`);

	const box = (await page.locator('[data-editor-root]').boundingBox())!;
	expect(box.width).toBeLessThanOrEqual(720);
	expect(box.width).toBeGreaterThan(700);

	const sidebar = page.getByRole('navigation', { name: 'Sidebar' });
	const left = (await sidebar.isVisible()) ? ((b) => b.x + b.width)((await sidebar.boundingBox())!) : 0;
	const right = await page.evaluate(() => document.documentElement.clientWidth);
	expect(Math.abs(box.x + box.width / 2 - (left + right) / 2)).toBeLessThanOrEqual(2);
});
