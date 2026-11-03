import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { pasteText } from './media-helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
const GARDEN = 'https://garden.example/';

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Links', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await body(page).click();
	return { id: notes[0], saves };
}

test('Scenario: Pasting a URL alone makes a preview card', async ({ page, request }) => {
	const { id, saves } = await openEmptyNote(page, request);

	await pasteText(page, GARDEN);

	const card = body(page).locator('a.link-card');
	await expect(card).toContainText('Garden Notes');
	await expect(card).toContainText('Seeds, soil & slow afternoons.');
	await expect(card.locator('small')).toHaveText('Garden');
	await expect(card.locator('img')).toHaveAttribute('src', /^\/images\/\d+$/);
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

	await expect(body(page).locator('p').first()).toHaveText(`Siehe ${GARDEN}`);
	await expect(body(page).locator('p a')).toHaveAttribute('href', GARDEN);
	await expect(body(page).locator('a.link-card')).toHaveCount(0);
});

test('Scenario: Undo turns the card back into a link', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await pasteText(page, GARDEN);
	await expect(body(page).locator('a.link-card')).toContainText('Garden Notes');
	await page.keyboard.press('ControlOrMeta+z');

	await expect(body(page).locator('a.link-card')).toHaveCount(0);
	await expect(body(page).locator('p a')).toHaveAttribute('href', GARDEN);
	await expect(body(page).locator('p').first()).toHaveText(GARDEN);
});

test('Scenario: Invalid URL stays plain text', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await pasteText(page, 'htp:/kaputt');

	await expect(body(page).locator('p').first()).toHaveText('htp:/kaputt');
	await expect(body(page).locator('a')).toHaveCount(0);
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
	await body(page).locator('p').last().click();

	await pasteText(page, GARDEN);

	const cards = body(page).locator('a.link-card');
	await expect(cards).toHaveCount(2);
	await expect(cards.nth(0)).toContainText('Garden Notes');
	await expect(cards.nth(1)).toContainText('Garden Notes');
});
