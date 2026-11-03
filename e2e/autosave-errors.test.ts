import { expect, test, type Page } from '@playwright/test';
import { COPY } from '../src/lib/copy.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');

async function openNote(page: Page, id: number) {
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${id}`);
	await body(page).click();
	return saves;
}

test('Scenario: Failed save shows a toast and keeps the content', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Fehler' }] });
	const saves = await openNote(page, notes[0]);
	await page.route(`**/api/notes/${notes[0]}`, (route) => route.fulfill({ status: 500, body: 'down' }), { times: 1 });

	await page.keyboard.type('Eins');
	await expect(page.getByRole('status').filter({ hasText: COPY.saveFailed })).toBeVisible();
	await expect(body(page)).toHaveText('Eins');

	await page.keyboard.type(' Zwei');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.bodyText).toBe('Eins Zwei');
});

test('Scenario: Unreachable server retries on the next change', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Offline' }] });
	const saves = await openNote(page, notes[0]);
	await page.route(`**/api/notes/${notes[0]}`, (route) => route.abort('internetdisconnected'), { times: 1 });

	await page.keyboard.type('Eins');
	await expect(page.locator('[data-save-state="error"]')).toBeVisible();
	await expect(body(page)).toHaveText('Eins');

	await page.keyboard.type(' Zwei');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.bodyText).toBe('Eins Zwei');
});

test('a click on the status retries a failed save', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Nochmal' }] });
	const saves = await openNote(page, notes[0]);
	await page.route(`**/api/notes/${notes[0]}`, (route) => route.fulfill({ status: 500, body: 'down' }), { times: 1 });

	await page.keyboard.type('Eins');
	await page.getByRole('button', { name: COPY.saveFailed }).click();
	await saves.settled();
	await expect(page.locator('[data-save-state]')).toHaveText(COPY.saved);
	expect((await storedNote(request, notes[0]))!.bodyText).toBe('Eins');
});

test('Scenario: Deleted note shows a notice on its next save', async ({ page, context, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Weg' }] });
	await openNote(page, notes[0]);
	const patches: string[] = [];
	page.on('request', (req) => {
		if (req.method() === 'PATCH') patches.push(req.url());
	});

	const other = await context.newPage();
	await open(other, '/');
	await other.evaluate((id) => fetch(`/api/notes/${id}`, { method: 'DELETE' }), notes[0]);
	await other.close();

	await page.keyboard.type('Wort');
	await expect(page.getByRole('alert')).toHaveText(COPY.noteDeleted);
	await page.keyboard.type(' mehr');
	await page.getByRole('textbox', { name: 'Title' }).fill('Noch da?');
	await page.waitForTimeout(1500);
	expect(patches).toHaveLength(1);
	expect(await storedNote(request, notes[0])).toBeNull();
});
