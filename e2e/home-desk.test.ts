import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

const notes = (count: number, extra: (i: number) => Record<string, unknown> = () => ({})) =>
	Array.from({ length: count }, (_, i) => ({ title: `Notiz ${i + 1}`, body: `Text ${i + 1}`, updatedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`, ...extra(i) }));

const noScroll = (page: import('@playwright/test').Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('Scenario: Home shows search, New note, Pinned and Recently edited', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { notes: notes(10, (i) => (i < 2 ? { pinnedAt: `2026-10-20T10:0${i}:00.000Z` } : {})) });
	await calm(page);
	await open(page, '/');

	const main = page.getByRole('main');
	await expect(main.getByRole('button', { name: /Search notes/ })).toBeVisible();
	// below 1024 px the phone bar's round "+" is the capture button and the desk has none of its own
	if (info.project.name === 'desktop') await expect(main.getByRole('button', { name: 'New note' })).toBeVisible();
	else await expect(page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(main.getByRole('region', { name: 'Pinned' })).toBeVisible();
	await expect(main.getByRole('region', { name: 'Recently edited' })).toBeVisible();
});

test.describe('in a far time zone', () => {
	test.use({ timezoneId: 'Pacific/Kiritimati' });
	test('Scenario: The Home kicker names the reader\'s day', async ({ page, request }) => {
		await reset(request);
		await seed(request, { notes: [{ title: 'Eine Notiz' }] });
		// 09:59 UTC is 23:59 on Monday 2 March in Kiritimati (UTC+14); the server is on its own clock and zone
		await page.clock.install({ time: new Date('2026-03-02T09:59:00.000Z') });
		await calm(page);
		await open(page, '/');

		const day = page.getByRole('main').locator('.kicker li[data-today]');
		await expect(day).toHaveText('Monday 2 March');
		await expect(day).toBeVisible();
		await page.clock.runFor(2 * 60_000);
		await expect(day).toHaveText('Tuesday 3 March');
	});
});

test('Scenario: Home search entry opens the palette', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Eine Notiz' }] });
	await calm(page);
	await open(page, '/');

	const entry = page.getByRole('main').getByRole('button', { name: /Search notes/ });
	await entry.click();
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Search notes' })).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeHidden();
	await entry.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Search notes' })).toBeFocused();
});

test('Scenario: Home has no folders', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Garten' }], notes: [{ title: 'A', folder: 0 }, { title: 'B', folder: 1 }] });
	await calm(page);
	await open(page, '/');

	const main = page.getByRole('main');
	await expect(main.getByRole('region', { name: 'Recently edited' })).toBeVisible();
	await expect(main.getByRole('region', { name: 'Folders' })).toHaveCount(0);
	await expect(main.locator('a[href^="/folders"]')).toHaveCount(0);
});

test('Scenario: Recently edited shows the eight latest notes', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: notes(10) });
	await calm(page);
	await open(page, '/');

	const recent = page.getByRole('main').getByRole('region', { name: 'Recently edited' });
	await expect(recent.getByRole('article')).toHaveCount(8);
	await expect(recent.getByRole('heading', { level: 3 })).toHaveText(['Notiz 10', 'Notiz 9', 'Notiz 8', 'Notiz 7', 'Notiz 6', 'Notiz 5', 'Notiz 4', 'Notiz 3']);
});

test('Scenario: No notes shows the welcome state even with folders', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Garten' }] });
	await calm(page);
	await open(page, '/');

	const main = page.getByRole('main');
	await expect(main.getByRole('heading', { name: 'Write your first note' })).toBeVisible();
	await expect(main.getByRole('button', { name: 'New note' })).toBeVisible();
	for (const name of ['Pinned', 'Recently edited', 'Folders']) await expect(main.getByRole('region', { name })).toHaveCount(0);

	await main.getByRole('button', { name: 'New note' }).click();
	await expect(page).toHaveURL(/\/notes\/\d+$/);
});

test('Scenario: Pinned is absent without pins', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Lose' }] });
	await calm(page);
	await open(page, '/');

	await expect(page.getByRole('main').getByRole('region', { name: 'Recently edited' })).toBeVisible();
	await expect(page.getByRole('main').getByRole('region', { name: 'Pinned' })).toHaveCount(0);
});

test('Scenario: One pinned note has no reorder controls', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', pinnedAt: '2026-10-01T10:00:00.000Z' }, { title: 'Lose' }] });
	await calm(page);
	await open(page, '/');

	const pinned = page.getByRole('main').getByRole('region', { name: 'Pinned' });
	await expect(pinned.getByRole('article')).toHaveCount(1);
	await expect(pinned.getByRole('button', { name: 'Drag to reorder' })).toHaveCount(0);
	await pinned.getByRole('button', { name: 'Note actions' }).click();
	await expect(page.getByRole('menuitem', { name: 'Unpin' })).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Move up' })).toHaveCount(0);
	await expect(page.getByRole('menuitem', { name: 'Move down' })).toHaveCount(0);
});

test('Scenario: Long titles and snippets stay in their entries', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await reset(request);
	await seed(request, {
		notes: [
			{ title: `Lang${'titel '.repeat(33)}`.slice(0, 200), body: 'x'.repeat(600), pinnedAt: '2026-10-01T10:00:00.000Z' },
			{ title: 'W'.repeat(200), body: `${'Zeile mit Inhalt '.repeat(30)}${'y'.repeat(400)}` }
		]
	});
	await calm(page);

	for (const width of [375, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await open(page, '/');
		const entries = page.getByRole('main').getByRole('article');
		expect(await entries.count()).toBeGreaterThan(1);
		for (const entry of await entries.all()) {
			const fit = await entry.evaluate((el) => {
				const box = el.getBoundingClientRect();
				const title = el.querySelector('h3')!;
				const snippet = el.querySelector('p')!;
				return {
					inside: [title, snippet].every((child) => child.getBoundingClientRect().right <= box.right + 1),
					titleWraps: title.getBoundingClientRect().height > parseFloat(getComputedStyle(title).lineHeight) * 1.5,
					lines: Math.round(snippet.clientHeight / parseFloat(getComputedStyle(snippet).lineHeight)),
					clipped: snippet.scrollHeight > snippet.clientHeight
				};
			});
			expect(fit.inside).toBe(true);
			expect(fit.titleWraps).toBe(true);
			expect(fit.lines).toBeLessThanOrEqual(3);
			expect(fit.clipped).toBe(true);
		}
		expect(await noScroll(page)).toBe(true);
	}
});

test('Scenario: One note reads singular', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', pinnedAt: '2026-10-01T10:00:00.000Z' }] });
	await calm(page);
	await open(page, '/');

	const main = page.getByRole('main');
	await expect(main.getByText('1 note', { exact: true })).toHaveCount(2);
	await expect(main.getByText(/\b1 notes\b/)).toHaveCount(0);
});

test('Scenario: Home New note opens a root note', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the phone bar owns capture there');
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Eine Notiz', folder: 0 }] });
	await calm(page);
	await open(page, '/');

	await page.getByRole('main').getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
	expect((await storedNote(request, id))!.folderId).toBeNull();
});
