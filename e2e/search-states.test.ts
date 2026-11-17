import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const main = (page: Page) => page.getByRole('main');
const cards = (page: Page) => main(page).getByRole('article');
const field = (page: Page) => main(page).getByRole('searchbox', { name: 'Search notes' });
const folder = (page: Page) => main(page).getByRole('combobox', { name: 'Folder' });
const tag = (page: Page) => main(page).getByRole('combobox', { name: 'Tag' });

test('Scenario: Typing replaces the URL after 200 ms', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Kyoto', body: 'Tempel' }] });
	await calm(page);
	await open(page, '/search');
	const before = await page.evaluate(() => history.length);
	// the last keystroke and the replace that carries the query, both on the page's clock
	await page.evaluate(() => {
		const w = window as unknown as { __typed: number; __replaced: number };
		w.__typed = w.__replaced = 0;
		document.addEventListener('input', () => (w.__typed = performance.now()), true);
		const replace = history.replaceState.bind(history);
		history.replaceState = (state, unused, url) => {
			if (!w.__replaced && String(url ?? '').includes('q=')) w.__replaced = performance.now();
			replace(state, unused, url);
		};
	});

	await field(page).pressSequentially('kyoto');
	await page.waitForTimeout(100);
	expect(new URL(page.url()).search).toBe('');
	await expect(page).toHaveURL((url) => url.pathname + url.search === '/search?q=kyoto');
	await expect(cards(page)).toHaveCount(1);
	expect(await page.evaluate(() => history.length)).toBe(before);
	const { typed, replaced } = await page.evaluate(() => {
		const w = window as unknown as { __typed: number; __replaced: number };
		return { typed: w.__typed, replaced: w.__replaced };
	});
	expect(replaced - typed).toBeGreaterThanOrEqual(195);
	expect(replaced - typed).toBeLessThan(1500);
});

test('Regression: a pending query does not follow the person to a note', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Kyoto', body: 'Tempel' }] });
	await calm(page);
	await open(page, '/search?q=kyoto');
	await expect(cards(page)).toHaveCount(1);

	await field(page).press('End');
	await field(page).pressSequentially('x');
	await cards(page).getByRole('link').first().click();
	await page.waitForURL(`**/notes/${notes[0]}`);
	await page.waitForTimeout(400);
	expect(new URL(page.url()).pathname).toBe(`/notes/${notes[0]}`);
});

test('Scenario: Changing a filter pushes a history entry', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [
			{ title: 'Garten Kyoto', body: 'Garten', folder: 0 },
			{ title: 'Garten Rezept', body: 'Garten' }
		]
	});
	await calm(page);
	await open(page, '/search?q=garten');
	await expect(cards(page)).toHaveCount(2);

	await folder(page).selectOption({ label: 'Reisen' });
	await expect(page).toHaveURL((url) => url.searchParams.get('folder') === String(folders[0]));
	await expect(cards(page)).toHaveCount(1);

	await page.goBack();
	await expect(page).toHaveURL((url) => url.pathname + url.search === '/search?q=garten');
	await expect(cards(page)).toHaveCount(2);
});

test('Scenario: Idle search page shows the hint', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Kyoto', body: 'Tempel' }] });
	await calm(page);
	await open(page, '/search');

	await expect(main(page).getByText('Search by title, text or tag, or pick a folder or tag.')).toBeVisible();
	await expect(cards(page)).toHaveCount(0);
});

test('Scenario: Query without hits says No notes match', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Kyoto', body: 'Tempel' }] });
	await calm(page);
	await open(page, '/search?q=zzzz');

	await expect(main(page).getByText('No notes match “zzzz”')).toBeVisible();
	await expect(cards(page)).toHaveCount(0);
});

test('Scenario: Filters without hits say No results', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Küche' }],
		notes: [{ title: 'Kyoto', body: 'Tempel', folder: 0, tags: ['Reise'] }, { title: 'Brot', body: 'Mehl', folder: 1, tags: ['Kochen'] }]
	});
	await calm(page);
	await open(page, '/search');
	const id = await tag(page).getByRole('option', { name: 'Reise', exact: true }).getAttribute('value');

	await open(page, `/search?folder=${folders[1]}&tag=${id}`);
	await expect(main(page).getByText('No results', { exact: true })).toBeVisible();
	await expect(cards(page)).toHaveCount(0);
});

test('Scenario: One result reads singular', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: [
			{ title: 'Kyoto', body: 'Tempel' },
			{ title: 'Brot', body: 'Mehl' }
		]
	});
	await calm(page);
	await open(page, '/search?q=kyoto');

	await expect(cards(page)).toHaveCount(1);
	await expect(main(page).getByText('1 result', { exact: true })).toBeVisible();
});

test('Scenario: Results stop at fifty', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: Array.from({ length: 60 }, (_, i) => ({ title: `Garten ${i + 1}`, body: `Beet ${i + 1}` })) });
	await calm(page);
	await open(page, '/search?q=garten');

	await expect(cards(page)).toHaveCount(50);
	await expect(main(page).getByText('50 results', { exact: true })).toBeVisible();
});

test('Scenario: Long query wraps and survives a reload', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewport');
	await reset(request);
	await seed(request, { notes: [{ title: 'Garten', body: 'Im Garten blüht die Kirsche' }] });
	await calm(page);
	await page.setViewportSize({ width: 375, height: 800 });
	await open(page, '/search');
	const long = Array.from({ length: 29 }, () => 'garten').join(' ').slice(0, 200);

	await field(page).fill(long);
	await expect(page).toHaveURL((url) => url.searchParams.get('q') === long);
	await expect(cards(page)).toHaveCount(1);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	await expect(field(page)).toHaveValue(long);
	await expect(cards(page)).toHaveCount(1);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

	await open(page, `/search?q=${'zzzz'.repeat(50)}`);
	await expect(main(page).getByText(/^No notes match/)).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Scenario: Filters are compact pills over a 16 px picker', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Kyoto', body: 'Tempel', folder: 0, tags: ['Reise'] }] });
	await calm(page);
	await open(page, '/search');
	for (const select of [folder(page), tag(page)]) {
		// the native picker takes the tap at 16 px, so iOS never zooms; it is invisible over the pill
		expect(await select.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
		expect(await select.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
		// the pill shows its label over a small value, as in the hi-fi
		const pill = select.locator('xpath=..');
		expect(await pill.locator('.seg-value').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(16);
		expect((await pill.boundingBox())!.height).toBeLessThanOrEqual(64);
	}

	await folder(page).selectOption({ label: 'Reisen' });
	await page.waitForURL((url) => url.searchParams.has('folder'));
	const chosen = folder(page).locator('xpath=..');
	await expect(chosen.locator('.seg-value')).toHaveText('Reisen');
	// charcoal: the same fill as the --surface-inverse token
	const [fill, charcoal] = await chosen.evaluate((el) => {
		const probe = document.createElement('div');
		probe.style.background = 'var(--surface-inverse)';
		document.body.append(probe);
		const token = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return [getComputedStyle(el).backgroundColor, token];
	});
	expect(fill).toBe(charcoal);
	await expect(tag(page).locator('xpath=..').locator('.seg-value')).toHaveText('Any tag');
});
