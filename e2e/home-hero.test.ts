import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

test('Scenario: Home shows the typographic hero', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Eine Notiz' }] });
	await calm(page);
	await open(page, '/');

	const hero = page.getByRole('region', { name: /Every note/ });
	const eyebrow = hero.getByText('Notes — Folders — Tags', { exact: true });
	await expect(eyebrow).toBeVisible();
	expect(await eyebrow.evaluate((el) => getComputedStyle(el).textTransform)).toBe('uppercase');

	const h1 = hero.getByRole('heading', { level: 1 });
	await expect(h1).toBeVisible();
	await expect(h1.getByText('Every note,')).toBeVisible();
	await expect(h1.getByText('in its place')).toBeVisible();
	await expect(h1.getByRole('emphasis')).toHaveCount(1);
	const { display, accent, color, lines } = await h1.evaluate((el) => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--accent)';
		document.body.append(probe);
		const accent = getComputedStyle(probe).color;
		probe.remove();
		const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
		return {
			display: getComputedStyle(el).fontFamily,
			accent,
			color: getComputedStyle(el.querySelector('em')!).color,
			lines: Math.round(el.getBoundingClientRect().height / lineHeight)
		};
	});
	expect(color).toBe(accent);
	expect(display).toMatch(/Newsreader/);
	expect(lines).toBe(2);

	await expect(hero.getByRole('button', { name: /Search notes/ })).toBeVisible();
	const cta = hero.getByRole('button', { name: 'New note' });
	await expect(cta).toBeVisible();
	await expect(cta.locator('svg')).toHaveCount(1);
});

test('Scenario: Home search bar opens the palette', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await page.getByRole('region', { name: /Every note/ }).getByRole('button', { name: /Search notes/ }).click();
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Search notes' })).toBeFocused();
});

test('Scenario: Home New note opens a root note', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Eine Notiz', folder: 0 }] });
	await calm(page);
	await open(page, '/');

	await page.getByRole('region', { name: /Every note/ }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
	expect((await storedNote(request, id))!.folderId).toBeNull();
});
