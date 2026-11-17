import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });
const input = (page: Page) => palette(page).getByRole('combobox', { name: 'Search notes' });

test('Scenario: Typing shows results with highlighted snippets', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: [
			{ title: 'Tulpenbeet', body: 'Im Garten blühen Tulpen' },
			{ title: 'Einkauf', body: 'Brot und Milch' }
		]
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('garten');

	const results = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(results).toHaveCount(1);
	await expect(results.first()).toContainText('Tulpenbeet');
	// <mark> has no ARIA role, so the highlight can only be found by tag
	await expect(results.first().locator('mark')).toHaveText('Garten');
	await expect(palette(page).getByRole('group', { name: 'Recent' })).toHaveCount(0);
});

test('Scenario: A title-only hit highlights its title', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Gartenplan', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('gartenplan');

	const row = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(row).toHaveCount(1);
	await expect(row).toContainText('Beete umgraben');
	await expect(row.locator('mark')).toHaveText(['Gartenplan']);
	// the mark sits in the title, and the snippet is the note's own text without one
	await expect(row.locator('.title mark')).toHaveText(['Gartenplan']);
	await expect(row.locator('.snippet mark')).toHaveCount(0);

	// the search page's card reads the same way
	await page.keyboard.press('Escape');
	await open(page, '/search?q=gartenplan');
	const card = page.getByRole('main').getByRole('listitem').filter({ hasText: 'Gartenplan' });
	await expect(card).toContainText('Beete umgraben');
	await expect(card.locator('mark')).toHaveText(['Gartenplan']);
	await expect(card.locator('[data-card-title] mark')).toHaveText(['Gartenplan']);
	await expect(card.locator('[data-card-snippet] mark')).toHaveCount(0);
});

test('Scenario: No hits shows No notes match', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Tulpenbeet', body: 'Im Garten' }] });
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('zzzz');

	await expect(palette(page)).toContainText('No notes match “zzzz”');
	await expect(palette(page).getByRole('group', { name: 'Notes' })).toHaveCount(0);
});

test('Scenario: Arrow keys and Enter open a result', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [
			{ title: 'Reise Lissabon', body: 'Alfama' },
			{ title: 'Reise Kyoto', body: 'Tempel' },
			{ title: 'Reiseapotheke', body: 'Pflaster' },
			{ title: 'Einkauf', body: 'Brot' }
		]
	});
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('reise');

	const results = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(results).toHaveCount(3);
	await expect(results.nth(0)).toHaveAttribute('aria-selected', 'true');
	const third = await results.nth(2).getAttribute('href');
	expect(notes.map((id) => `/notes/${id}`)).toContain(third);

	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(results.nth(2)).toHaveAttribute('aria-selected', 'true');
	await expect(results.nth(0)).toHaveAttribute('aria-selected', 'false');
	await page.keyboard.press('Enter');

	await expect(page).toHaveURL((url) => url.pathname === third);
	await expect(palette(page)).toHaveCount(0);
});

test('Scenario: Escape closes the palette', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const nav = page.getByRole('navigation', { name: info.project.name === 'desktop' ? 'Sidebar' : 'Bottom bar' });
	const button = nav.getByRole('button', { name: /Search/ });
	await button.focus();
	await page.keyboard.press('Enter');
	await expect(palette(page)).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(palette(page)).toHaveCount(0);
	await expect(button).toBeFocused();
});

const searchFor = (term: string) => (url: URL) => url.pathname === '/api/search' && url.searchParams.get('q') === term;

test('Scenario: Enter on a note waits for the answer', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [
			{ title: 'Beta', body: 'Zweiter', updatedAt: new Date(Date.now() - 86_400_000).toISOString() },
			{ title: 'Alpha', body: 'Erster' }
		]
	});
	await calm(page);
	await open(page, '/');
	let release!: () => void;
	const held = new Promise<void>((resolve) => (release = resolve));
	await page.route(searchFor('beta'), async (route) => {
		await held;
		await route.continue();
	});
	await page.keyboard.press('ControlOrMeta+k');
	await expect(palette(page).getByRole('group', { name: 'Recent' }).getByRole('option').first()).toContainText('Alpha');

	// the first row is still the recent "Alpha": Enter there does nothing while "beta" has no answer
	const asked = page.waitForRequest((req) => searchFor('beta')(new URL(req.url())));
	await input(page).fill('beta');
	await asked;
	await page.keyboard.press('Enter');
	await expect(palette(page)).toBeVisible();
	expect(new URL(page.url()).pathname).toBe('/');

	release();
	await expect(palette(page).getByRole('group', { name: 'Notes' }).getByRole('option')).toHaveCount(1);
	// the held Enter was dropped, not queued: the answer alone opens nothing
	await expect(palette(page)).toBeVisible();
	expect(new URL(page.url()).pathname).toBe('/');
	await page.keyboard.press('Enter');
	await page.waitForURL(`**/notes/${notes[0]}`);
});

test('Scenario: A failed search clears the hits and says so', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Beta', body: 'Zweiter' }] });
	await calm(page);
	await open(page, '/');
	await page.route(searchFor('betax'), (route) => route.abort());
	await page.keyboard.press('ControlOrMeta+k');

	await input(page).fill('beta');
	const notesGroup = palette(page).getByRole('group', { name: 'Notes' });
	await expect(notesGroup.getByRole('option')).toHaveCount(1);
	// the next query fails: the hit for "beta" goes, the list says the search failed, and Enter opens nothing stale
	const asked = page.waitForRequest((req) => searchFor('betax')(new URL(req.url())));
	await input(page).fill('betax');
	await asked;
	await expect(palette(page).getByRole('status').filter({ hasText: "Couldn't load — try again" })).toBeVisible();
	await expect(notesGroup).toHaveCount(0);
	await expect(palette(page).locator('[aria-selected="true"]')).toHaveText('New note');
	await input(page).press('ArrowUp');
	await expect(palette(page).getByRole('option', { name: 'See all results' })).toHaveAttribute('aria-selected', 'true');
	await page.keyboard.press('Enter');
	await page.waitForURL((url) => url.pathname === '/search' && url.searchParams.get('q') === 'betax');
});

test('Regression: See all results runs while the answer is pending', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Beta', body: 'Zweiter' }] });
	await calm(page);
	await open(page, '/');
	await page.route(searchFor('beta'), async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 600));
		await route.continue();
	});
	await page.keyboard.press('ControlOrMeta+k');
	await expect(palette(page).getByRole('group', { name: 'Recent' }).getByRole('option')).toHaveCount(1);

	const asked = page.waitForRequest((req) => searchFor('beta')(new URL(req.url())));
	await input(page).fill('beta');
	await input(page).press('ArrowUp');
	await expect(palette(page).getByRole('option', { name: 'See all results' })).toHaveAttribute('aria-selected', 'true');
	await asked;
	await page.keyboard.press('Enter');
	await page.waitForURL((url) => url.pathname === '/search' && url.searchParams.get('q') === 'beta');
});

test('Regression: options stay out of the tab order and follow the arrow keys', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Tulpenbeet', body: 'Garten' }, { title: 'Gartenplan', body: 'Garten' }] });
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await input(page).fill('garten');
	const options = palette(page).getByRole('option');
	await expect(palette(page).getByRole('group', { name: 'Notes' }).getByRole('option')).toHaveCount(2);

	for (const option of await options.all()) await expect(option).toHaveAttribute('tabindex', '-1');
	await expect(input(page)).toHaveAttribute('aria-activedescendant', (await options.nth(0).getAttribute('id'))!);
	await input(page).press('ArrowDown');
	await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
	await expect(input(page)).toHaveAttribute('aria-activedescendant', (await options.nth(1).getAttribute('id'))!);
	await expect(palette(page).locator('[aria-selected="true"]')).toHaveCount(1);
	await page.keyboard.press('Tab');
	expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).not.toBe('option');
});
