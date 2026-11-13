import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const HOUR = 3_600_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

test('Scenario: Note card shows its parts', async ({ page, request }) => {
	await reset(request);
	const long = 'Im Garten blühen die ersten Krokusse und der Boden ist noch kühl und feucht vom Regen der letzten Tage. '.repeat(6);
	const { folders } = await seed(request, {
		folders: [{ name: 'Garten' }],
		notes: [{ title: 'Frühling', icon: '🌿', body: long, folder: 0, tags: ['Beet', 'Saat'], pinnedAt: ago(HOUR), updatedAt: ago(2 * HOUR) }]
	});
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const card = page.getByRole('article');
	await expect(card).toHaveCount(1);
	await expect(card.getByText('🌿', { exact: true })).toBeVisible();
	await expect(card.getByRole('heading')).toHaveText('Frühling');
	const snippet = card.getByRole('paragraph');
	await expect(snippet).toContainText('Im Garten blühen');
	const clamp = await snippet.evaluate((el) => ({ lineHeight: parseFloat(getComputedStyle(el).lineHeight), height: el.clientHeight, full: el.scrollHeight }));
	expect(clamp.height).toBeLessThanOrEqual(clamp.lineHeight * 3 + 1);
	expect(clamp.full).toBeGreaterThan(clamp.height);
	await expect(card.getByRole('listitem')).toHaveText(['Beet', 'Saat']);
	await expect(card.getByText('2h ago', { exact: true })).toBeVisible();
	await expect(card.getByRole('img', { name: 'Pinned' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Scenario: Card shows at most three tags and +n', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Garten' }],
		notes: [{ title: 'Viele Tags', body: 'Text', folder: 0, tags: ['eins', 'zwei', 'drei', 'vier', 'fünf'] }]
	});
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const tags = page.getByRole('article').getByRole('listitem');
	await expect(tags).toHaveText(['eins', 'zwei', 'drei', '+2']);
});

test('Scenario: Note without text shows Empty note', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Garten' }], notes: [{ title: 'Leer', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(page.getByRole('article').getByRole('paragraph')).toHaveText('Empty note');
});

test('Scenario: Untitled note card reads Untitled', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Garten' }], notes: [{ body: 'Nur Text', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(page.getByRole('article').getByRole('heading')).toHaveText('Untitled');
	await expect(page.getByRole('article').getByRole('paragraph')).toHaveText('Nur Text');
});

test('a whitespace-only title reads Untitled on the card', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Garten' }], notes: [{ title: ' ', body: 'Nur Text', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(page.getByRole('article').getByRole('heading')).toHaveText('Untitled');
});
