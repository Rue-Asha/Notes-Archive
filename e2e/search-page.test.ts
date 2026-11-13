import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const cards = (page: Page) => page.getByRole('article');
const titles = (page: Page) => cards(page).getByRole('heading');
const field = (page: Page) => page.getByRole('searchbox', { name: 'Search notes' });
const folder = (page: Page) => page.getByRole('combobox', { name: 'Folder' });
const tag = (page: Page) => page.getByRole('combobox', { name: 'Tag' });

async function seedGarden(request: APIRequestContext) {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Küche' }],
		notes: [
			{ title: 'Garten in Kyoto', body: 'Im Garten blüht die Kirsche', folder: 1, tags: ['Reise'], updatedAt: '2026-10-05T10:00:00.000Z' },
			{ title: 'Gartenreise Wien', body: 'Ein Garten am Stadtrand', folder: 0, tags: ['Reise'], updatedAt: '2026-10-04T10:00:00.000Z' },
			{ title: 'Garten Rezept', body: 'Garten Kräuter und Brot', folder: 2, tags: ['Kochen'], updatedAt: '2026-10-03T10:00:00.000Z' },
			{ title: 'Garten Notiz', body: 'Beete im Garten', folder: 0, tags: ['Kochen'], updatedAt: '2026-10-02T10:00:00.000Z' },
			{ title: 'Packliste', body: 'Koffer', folder: 2, tags: ['Reise'], updatedAt: '2026-10-06T10:00:00.000Z' }
		]
	});
}

test('Scenario: Search page lists results for the query in the URL', async ({ page, request }) => {
	await seedGarden(request);
	await calm(page);
	await open(page, '/search?q=garten');

	await expect(field(page)).toHaveValue('garten');
	await expect(cards(page)).toHaveCount(4);
	await expect(titles(page).filter({ hasText: 'Packliste' })).toHaveCount(0);
	const kyoto = cards(page).filter({ hasText: 'Garten in Kyoto' });
	// <mark> has no ARIA role, so the highlight can only be found by tag
	await expect(kyoto.locator('mark').first()).toHaveText('Garten');
});

test('Scenario: Folder filter includes sub-folders', async ({ page, request }) => {
	await seedGarden(request);
	await calm(page);
	await open(page, '/search?q=garten');

	await folder(page).selectOption({ label: 'Reisen' });
	await expect(page).toHaveURL(/folder=\d+/);
	await expect(titles(page)).toHaveCount(3);
	await expect(titles(page).filter({ hasText: 'Garten in Kyoto' })).toHaveCount(1);
	await expect(titles(page).filter({ hasText: 'Gartenreise Wien' })).toHaveCount(1);
	await expect(titles(page).filter({ hasText: 'Garten Notiz' })).toHaveCount(1);
	await expect(titles(page).filter({ hasText: 'Garten Rezept' })).toHaveCount(0);
});

test('Scenario: Folder and tag filters combine and stay in the URL', async ({ page, request }) => {
	await seedGarden(request);
	await calm(page);
	await open(page, '/search?q=garten');

	await folder(page).selectOption({ label: 'Reisen' });
	await expect(page).toHaveURL(/folder=\d+/);
	await tag(page).selectOption({ label: 'Reise' });
	await expect(page).toHaveURL(/q=garten&folder=\d+&tag=\d+/);
	await expect(titles(page)).toHaveCount(2);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(field(page)).toHaveValue('garten');
	await expect(folder(page).getByRole('option', { selected: true })).toHaveText('Reisen');
	await expect(tag(page).getByRole('option', { selected: true })).toHaveText('Reise');
	await expect(titles(page)).toHaveCount(2);
	await expect(titles(page).filter({ hasText: 'Garten Notiz' })).toHaveCount(0);

	await page.goBack();
	await expect(page).toHaveURL((url) => url.searchParams.has('folder') && !url.searchParams.has('tag') && url.searchParams.get('q') === 'garten');
	await expect(titles(page)).toHaveCount(3);
	await expect(tag(page).getByRole('option', { selected: true })).toHaveText('Any tag');
});

test('Scenario: Search page with only filters lists matching notes', async ({ page, request }) => {
	await seedGarden(request);
	await calm(page);
	await open(page, '/search');
	const id = await tag(page).getByRole('option', { name: 'Reise', exact: true }).getAttribute('value');

	await open(page, `/search?tag=${id}`);
	await expect(field(page)).toHaveValue('');
	await expect(titles(page)).toHaveText(['Packliste', 'Garten in Kyoto', 'Gartenreise Wien']);
});
