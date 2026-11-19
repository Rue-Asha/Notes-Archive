import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed, storedNote, treeScope, watchSaves } from './helpers.ts';

const props = (page: Page) => page.getByRole('group', { name: 'Properties' });
// a tag chip is its label plus a "Remove <label>" button
const chips = (page: Page) => props(page).getByRole('button', { name: /^Remove / });

// the phone folds the properties into one line
async function expand(page: Page) {
	const summary = props(page).getByRole('button', { name: /^Properties/ });
	if (await summary.count()) await summary.click();
}

async function expectChips(page: Page, names: string[]) {
	await expand(page);
	await expect(chips(page)).toHaveCount(names.length);
	for (const [i, name] of names.entries()) await expect(chips(page).nth(i)).toHaveAccessibleName(`Remove ${name}`);
}

test('Scenario: Add tags with Enter and comma', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Trip', body: 'x' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await expand(page);
	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('Reise');
	await input.press('Enter');
	await input.pressSequentially('Japan,');
	await expectChips(page, ['Reise', 'Japan']);
	await expect(input).toHaveValue('');

	await saves.settled();
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expectChips(page, ['Reise', 'Japan']);
	expect((await storedNote(request, notes[0]))!.tags).toEqual(['Reise', 'Japan']);
});

test('Scenario: Autocomplete suggests existing tags ignoring case', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Alt', tags: ['Übung'] }, { title: 'Neu', body: 'x' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[1]}`);

	await expand(page);
	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('ÜB');
	const suggestion = props(page).getByRole('option', { name: 'Übung' });
	await expect(suggestion).toBeVisible();
	await suggestion.click();
	await expectChips(page, ['Übung']);
	await expect(props(page).getByRole('option')).toHaveCount(0);

	await saves.settled();
	expect((await storedNote(request, notes[1]))!.tags).toEqual(['Übung']);
	expect((await counts(request)).tags).toBe(1);
});

test('Scenario: Backspace on an empty input removes the last chip', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Trip', body: 'x', tags: ['Reise', 'Japan'] }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await expectChips(page, ['Reise', 'Japan']);
	await expand(page);
	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.click();
	await input.press('Backspace');
	await expectChips(page, ['Reise']);

	await saves.settled();
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expectChips(page, ['Reise']);
	expect((await storedNote(request, notes[0]))!.tags).toEqual(['Reise']);
});

test('Scenario: Typing a new name creates a tag', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Beet', body: 'x' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expand(page);
	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('Gartenbau');
	await input.press('Enter');
	await expectChips(page, ['Gartenbau']);

	if (info.project.name === 'phone') {
		await input.blur();
	}
	const scope = await treeScope(page, info);
	const link = scope.getByRole('link', { name: /Gartenbau/ });
	await expect(link).toBeVisible();
	await expect(link.getByText('1', { exact: true })).toBeVisible();
});

test('Scenario: Whitespace-only and duplicate tags are ignored in the input', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Trip', body: 'x', tags: ['Reise'] }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expand(page);
	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('   ');
	await input.press('Enter');
	await input.fill('reise');
	await input.press('Enter');
	await expectChips(page, ['Reise']);
});

test('Scenario: The tag field has the hairline border of the chips beside it', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Trip', body: 'x', tags: ['Reise'] }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await expand(page);

	const shadow = await page.getByRole('combobox', { name: 'Add a tag' }).evaluate((el) => {
		const probe = document.createElement('div');
		probe.style.boxShadow = 'var(--ring-hairline)';
		document.body.append(probe);
		const hairline = getComputedStyle(probe).boxShadow;
		probe.remove();
		return { own: getComputedStyle(el).boxShadow, hairline };
	});
	expect(shadow.own).toBe(shadow.hairline);
});
