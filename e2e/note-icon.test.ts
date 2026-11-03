import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const header = (page: Page) => page.locator('[data-note-header]');
const picker = (page: Page) => page.getByRole('dialog', { name: 'Choose an emoji' });

test('Scenario: Pick, change and remove the note icon', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const steps: [opener: string, choice: string, stored: string | null][] = [
		['Add icon', 'books', '📚'],
		['Change icon', 'herb', '🌿'],
		['Change icon', 'Remove', null]
	];
	for (const [opener, choice, stored] of steps) {
		await header(page).getByRole('button', { name: opener }).click();
		await picker(page).getByRole('button', { name: choice, exact: true }).click();
		await expect(picker(page)).toBeHidden();
		await saves.settled();
		expect((await storedNote(request, notes[0]))!.icon).toBe(stored);

		await page.reload();
		if (stored) await expect(header(page).getByRole('button', { name: 'Change icon' })).toHaveText(stored);
		else await expect(header(page).getByRole('button', { name: 'Add icon' })).toBeVisible();
	}
});

test('Scenario: Emoji picker is usable on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout of the picker');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Lesen' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await header(page).getByRole('button', { name: 'Add icon' }).tap();
	const box = (await picker(page).boundingBox())!;
	expect(box.x).toBeGreaterThanOrEqual(0);
	expect(box.y).toBeGreaterThanOrEqual(0);
	expect(box.x + box.width).toBeLessThanOrEqual(390);
	expect(box.y + box.height).toBeLessThanOrEqual(844);

	await picker(page).getByRole('searchbox', { name: 'Search emoji' }).fill('book');
	await expect(picker(page).getByRole('button', { name: 'books', exact: true })).toBeVisible();
	await expect(picker(page).getByRole('button', { name: 'herb', exact: true })).toHaveCount(0);
	await picker(page).getByRole('button', { name: 'books', exact: true }).tap();

	await expect(header(page).getByRole('button', { name: 'Change icon' })).toHaveText('📚');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.icon).toBe('📚');
});
