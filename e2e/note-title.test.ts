import { expect, test } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const field = (page: import('@playwright/test').Page) => page.getByRole('textbox', { name: 'Title' });

async function untitled(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext, body = 'Text') {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '', body }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	return notes[0];
}

test('Scenario: Enter in the title adds a line break', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '', body: 'Text' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const title = field(page);
	const one = (await title.boundingBox())!.height;
	await title.click();
	await page.keyboard.type('Japan');
	await page.keyboard.press('Enter');
	await page.keyboard.type('2026');

	await expect(title).toHaveValue('Japan\n2026');
	expect((await title.boundingBox())!.height).toBeGreaterThan(one * 1.8);
	await expect(title).toBeFocused();
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.title).toBe('Japan\n2026');
});

test('Scenario: Cmd or Ctrl+Enter moves to the body', async ({ page, request }) => {
	await untitled(page, request);
	const title = field(page);
	await title.click();
	await page.keyboard.type('Eins');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Zwei');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Home');

	await page.keyboard.press('ControlOrMeta+Enter');
	await expect(editor(page)).toBeFocused();
	await expect(title).toHaveValue('Eins\nZwei');
	await page.keyboard.type('X');
	await expect(editor(page).getByRole('paragraph').first()).toHaveText(/^X/);
});

test('Scenario: ArrowDown on the last title line moves to the body', async ({ page, request }) => {
	await untitled(page, request);
	const title = field(page);
	await title.click();
	await page.keyboard.type('Eins');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Zwei');
	await page.keyboard.press('ArrowUp');

	await page.keyboard.press('ArrowDown');
	await expect(title).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(editor(page)).toBeFocused();
	await expect(title).toHaveValue('Eins\nZwei');
	await page.keyboard.type('X');
	await expect(editor(page).getByRole('paragraph').first()).toHaveText('XText');
});

test('Regression: one ArrowDown from inside the last title line moves to the body', async ({ page, request }) => {
	await untitled(page, request);
	const title = field(page);
	await title.click();
	await page.keyboard.type('Eins');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Zwei');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');

	await page.keyboard.press('ArrowDown');
	await expect(editor(page)).toBeFocused();
	await page.keyboard.type('X');
	await expect(editor(page).getByRole('paragraph').first()).toHaveText('XText');
	await expect(title).toHaveValue('Eins\nZwei');
});

test('Scenario: Title is the page heading', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Garten');
});

test('Scenario: Pasted CRLF text keeps its line breaks', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '', body: 'Text' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const title = field(page);
	await title.focus();
	await title.evaluate((el) => {
		const dt = new DataTransfer();
		dt.setData('text/plain', 'Eins\r\nZwei');
		el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
		document.execCommand('insertText', false, 'Eins\r\nZwei');
	});

	await expect(title).toHaveValue('Eins\nZwei');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.title).toBe('Eins\nZwei');
});

test('Scenario: Many short title lines stay in the column', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the twelve lines are typed at 375 px');
	await page.setViewportSize({ width: 375, height: 800 });
	await untitled(page, request);
	const title = field(page);
	await title.click();
	const lines = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag', 'Packen', 'Zug', 'Hotel', 'Budget', 'Backup'];
	for (const [i, line] of lines.entries()) {
		await page.keyboard.type(line);
		if (i < lines.length - 1) await page.keyboard.press('Enter');
	}

	await expect(title).toHaveValue(lines.join('\n'));
	const box = (await title.boundingBox())!;
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(375);
	expect(await title.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
