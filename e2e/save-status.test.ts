import { expect, test } from '@playwright/test';
import { COPY } from '../src/lib/copy.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const status = (page: import('@playwright/test').Page) => page.locator('[data-save-state]');

test('Scenario: Save status shows Saving and Saved', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Status', body: 'x' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	await page.keyboard.press('End');

	await page.keyboard.type('Mehr');
	await expect(status(page)).toHaveText(COPY.saving);
	await expect(status(page)).toHaveText(COPY.saved);
});

test('Scenario: Failed saves show one toast and a retry status', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Fehler', body: 'x' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	await page.keyboard.press('End');
	await page.route(`**/api/notes/${notes[0]}`, (route) => route.fulfill({ status: 500, body: 'down' }), { times: 3 });

	for (const word of ['Eins', 'Zwei', 'Drei']) {
		await page.keyboard.type(word);
		await expect(status(page)).toHaveText(COPY.saveFailed);
		await page.waitForTimeout(700);
	}
	await expect(page.getByRole('status').filter({ hasText: COPY.saveFailed })).toHaveCount(1);
	const retry = page.getByRole('button', { name: COPY.saveFailed });
	await expect(retry).toHaveAttribute('data-save-state', 'error');

	await retry.click();
	await saves.settled();
	await expect(status(page)).toHaveText(COPY.saved);
	expect((await storedNote(request, notes[0]))!.bodyText).toBe('xEinsZweiDrei');
	await expect(page.getByRole('button', { name: COPY.saveFailed })).toHaveCount(0);
});

test('Scenario: Saving stops after the note was deleted elsewhere', async ({ page, context, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Weg', body: 'x' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	const patches: string[] = [];
	page.on('request', (req) => {
		if (req.method() === 'PATCH') patches.push(req.url());
	});

	const other = await context.newPage();
	await open(other, '/');
	await other.evaluate((id) => fetch(`/api/notes/${id}`, { method: 'DELETE' }), notes[0]);
	await other.close();

	await page.keyboard.type('Wort');
	await expect(status(page)).toHaveText(COPY.noteDeleted);
	await page.keyboard.type(' mehr');
	await page.waitForTimeout(1500);
	expect(patches).toHaveLength(1);
});

test('Scenario: Save status is not a live region', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Ruhig', body: 'x' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const live = await status(page).evaluate((el) => {
		const found: string[] = [];
		for (let node: Element | null = el; node; node = node.parentElement) {
			if (node.hasAttribute('aria-live') || ['status', 'alert', 'log'].includes(node.getAttribute('role') ?? '')) found.push(node.tagName);
		}
		return found;
	});
	expect(live).toEqual([]);
});
