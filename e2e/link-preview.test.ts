import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { pasteText } from './media-helpers.ts';

const GARDEN = 'https://garden.example/';

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Links', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	return { id: notes[0], saves };
}

test('Scenario: Pasting a URL alone makes a preview card', async ({ page, request }) => {
	const { id, saves } = await openEmptyNote(page, request);

	await pasteText(page, GARDEN);

	const card = editor(page).getByRole('link', { name: /Garden Notes/ });
	await expect(card).toContainText('Garden Notes');
	await expect(card).toContainText('Seeds, soil & slow afternoons.');
	await expect(card.getByText('Garden', { exact: true })).toBeVisible();
	await expect(card.getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(card).toHaveAttribute('href', GARDEN);
	await saves.settled();
	const node = ((await storedNote(request, id))!.content.content ?? []).find((b: JSONContent) => b.type === 'linkPreview');
	expect(node?.attrs).toMatchObject({
		url: GARDEN,
		domain: 'garden.example',
		title: 'Garden Notes',
		description: 'Seeds, soil & slow afternoons.',
		siteName: 'Garden',
		imageId: expect.any(Number)
	});
});

test('Scenario: URL inside a sentence stays an inline link', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('Siehe ');
	await pasteText(page, GARDEN);

	await expect(editor(page).getByRole('paragraph').first()).toHaveText(`Siehe ${GARDEN}`);
	await expect(editor(page).getByRole('paragraph').getByRole('link')).toHaveAttribute('href', GARDEN);
	await expect(editor(page).getByRole('link', { name: /Garden Notes/ })).toHaveCount(0);
});

test('Scenario: Undo turns the card back into a link', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await pasteText(page, GARDEN);
	await expect(editor(page).getByRole('link', { name: /Garden Notes/ })).toBeVisible();
	await page.keyboard.press('ControlOrMeta+z');

	await expect(editor(page).getByRole('link', { name: /Garden Notes/ })).toHaveCount(0);
	await expect(editor(page).getByRole('paragraph').getByRole('link')).toHaveAttribute('href', GARDEN);
	await expect(editor(page).getByRole('paragraph').first()).toHaveText(GARDEN);
});

test('Scenario: Invalid URL stays plain text', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await pasteText(page, 'htp:/kaputt');

	await expect(editor(page).getByRole('paragraph').first()).toHaveText('htp:/kaputt');
	await expect(editor(page).getByRole('link')).toHaveCount(0);
});

test('Pasting a URL again fills the new card even when an older bare card for it exists', async ({ page, request }) => {
	await reset(request);
	const content: JSONContent = {
		type: 'doc',
		content: [{ type: 'linkPreview', attrs: { url: GARDEN, domain: 'garden.example' } }, { type: 'paragraph' }]
	};
	const { notes } = await seed(request, { notes: [{ title: 'Links', content }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	// the middle of the editor can land on the seeded card, which an atom click would select and the paste would replace
	await editor(page).getByRole('paragraph').last().click();

	await pasteText(page, GARDEN);

	const cards = editor(page).getByRole('link', { name: /Garden Notes/ });
	await expect(cards).toHaveCount(2);
	await expect(cards.nth(0)).toContainText('Garden Notes');
	await expect(cards.nth(1)).toContainText('Garden Notes');
});
