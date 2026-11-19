import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const HOUR = 3_600_000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const recent = (page: import('@playwright/test').Page) => page.getByRole('main').getByRole('region', { name: 'Recently edited' });

test('Scenario: Note card shows its parts', async ({ page, request }) => {
	await reset(request);
	const long = 'Im Garten blühen die ersten Krokusse und der Boden ist noch kühl und feucht vom Regen der letzten Tage. '.repeat(6);
	await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [{ title: 'Frühling', icon: '🌿', body: long, folder: 0, tags: ['Beet', 'Saat'], updatedAt: ago(2 * HOUR) }]
	});
	await calm(page);
	await open(page, '/');

	const card = recent(page).getByRole('article');
	await expect(card).toHaveCount(1);
	await expect(card.getByText('🌿', { exact: true })).toBeVisible();
	await expect(card.getByRole('heading')).toHaveText('Frühling');
	const snippet = card.getByRole('paragraph');
	await expect(snippet).toContainText('Im Garten blühen');
	const clamp = await snippet.evaluate((el) => ({ lineHeight: parseFloat(getComputedStyle(el).lineHeight), height: el.clientHeight, full: el.scrollHeight }));
	expect(clamp.height).toBeLessThanOrEqual(clamp.lineHeight * 3 + 1);
	expect(clamp.full).toBeGreaterThan(clamp.height);
	await expect(card.getByText('Reisen', { exact: true })).toBeVisible();
	await expect(card.getByRole('listitem')).toHaveText(['Beet', '+1']);
	await expect(card.getByText('2h ago', { exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Scenario: Card shows its first tag and +n', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Viele Tags', body: 'Text', tags: ['eins', 'zwei', 'drei', 'vier', 'fünf'] }] });
	await calm(page);
	await open(page, '/');

	const tags = recent(page).getByRole('article').getByRole('listitem');
	await expect(tags).toHaveText(['eins', '+4']);
});

test('Scenario: Long tags never run into the time', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await reset(request);
	const long = ['dringend-wichtig-sofort', 'ideen-fuer-spaeter', 'reise', 'garten', 'kueche'];
	await seed(request, {
		folders: [{ name: 'Reisen und Ausfluege' }],
		notes: [
			{ title: 'Berlin trip', body: 'Drei Tage.', folder: 0, tags: long.slice(0, 2), pinnedAt: '2026-11-01T09:00:00.000Z' },
			{ title: 'Packliste', body: 'Socken.', folder: 0, tags: long, pinnedAt: '2026-11-02T09:00:00.000Z' },
			{ title: 'Rezepte', body: 'Kürbis.', tags: long }
		]
	});
	await calm(page);
	await open(page, '/');
	const tagPage = (await page.locator('a[href^="/tags/"]', { hasText: 'dringend-wichtig-sofort' }).first().getAttribute('href'))!;

	for (const width of [375, 768, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		for (const path of ['/', tagPage]) {
			await open(page, path);
			const problems = await page.getByRole('main').locator('[data-note-card]').evaluateAll((cards) =>
				cards.flatMap((card) => {
					const time = card.querySelector<HTMLElement>('[data-card-time]')!;
					const t = time.getBoundingClientRect();
					const out: string[] = [];
					if (time.scrollWidth > time.clientWidth + 1) out.push(`${time.textContent} is cut`);
					for (const pill of card.querySelectorAll<HTMLElement>('[data-card-tag], [data-card-more-tags]')) {
						const p = pill.getBoundingClientRect();
						const shown = Math.min(p.right, pill.closest('ul')!.getBoundingClientRect().right);
						if (shown > t.left + 1 && p.left < t.right - 1 && p.top < t.bottom && p.bottom > t.top) out.push(`${pill.textContent} reaches into ${time.textContent}`);
						if (pill.matches('[data-card-more-tags]') && (pill.scrollWidth > pill.clientWidth + 1 || p.right > shown + 0.5)) out.push(`${pill.textContent} is cut`);
					}
					return out;
				})
			);
			expect(problems, `${path} at ${width}`).toEqual([]);
		}
	}
});

test('Scenario: Note without text shows Empty note', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Leer' }] });
	await calm(page);
	await open(page, '/');

	await expect(recent(page).getByRole('article').getByRole('paragraph')).toHaveText('Empty note');
});

test('Scenario: Untitled note card reads Untitled', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Garten' }], notes: [{ body: 'Nur Text', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(page.locator('[data-note-row] [data-note-title]')).toHaveText('Untitled');
	await expect(page.locator('[data-note-row] .snippet')).toHaveText('Nur Text');
});

test('a whitespace-only title reads Untitled on the card', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Garten' }], notes: [{ title: ' ', body: 'Nur Text', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(page.locator('[data-note-row] [data-note-title]')).toHaveText('Untitled');
});

test('Regression: One long unbreakable tag stays inside the card and keeps the time', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [{ title: 'Packliste', body: 'Socken.', folder: 0, tags: ['ReiseplanungMitSehrLangemTagNamenOhneLeerzeichen'], pinnedAt: '2026-11-02T09:00:00.000Z' }]
	});
	await calm(page);
	await open(page, '/');

	const card = (await page.getByRole('main').locator('[data-note-card]').first().boundingBox())!;
	const tag = (await page.getByRole('main').locator('[data-card-tag]').first().boundingBox())!;
	const time = (await page.getByRole('main').locator('[data-card-time]').first().boundingBox())!;
	expect(tag.x + tag.width).toBeLessThanOrEqual(card.x + card.width);
	expect(time.x + time.width).toBeLessThanOrEqual(card.x + card.width);
	expect(tag.x + tag.width).toBeLessThanOrEqual(time.x + 1);
});
