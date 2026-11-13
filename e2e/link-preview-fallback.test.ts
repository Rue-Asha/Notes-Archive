import { expect, test, type Locator, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { pasteText } from './media-helpers.ts';

async function pasteAlone(page: Page, request: Parameters<typeof reset>[0], url: string) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Links', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	const preview = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/preview');
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	await pasteText(page, url);
	await preview;
	await saves.settled();
	const node = ((await storedNote(request, notes[0]))!.content.content ?? []).find((b: JSONContent) => b.type === 'linkPreview');
	return { card: editor(page).getByRole('link'), node };
}

async function expectDomainOnly(card: Locator, domain: string, url: string) {
	await expect(card.getByText(domain, { exact: true })).toBeVisible();
	await expect(card.getByText(url, { exact: true })).toBeVisible();
	await expect(card.getByRole('img').or(card.getByRole('presentation'))).toHaveCount(0);
	await expect(card.getByRole('paragraph')).toBeHidden();
}

test('Scenario: Failed preview shows domain and URL only', async ({ page, request }) => {
	const url = 'https://blocked.example/page';
	const { card, node } = await pasteAlone(page, request, url);

	await expectDomainOnly(card, 'blocked.example', url);
	expect(node?.attrs).toMatchObject({ url, domain: 'blocked.example', title: null, description: null, siteName: null, imageId: null });
});

test('Scenario: Private address gives a domain-only card', async ({ page, request }) => {
	const url = 'http://192.168.1.10/admin';
	const { card, node } = await pasteAlone(page, request, url);

	await expectDomainOnly(card, '192.168.1.10', url);
	expect(node?.attrs).toMatchObject({ url, domain: '192.168.1.10', title: null, imageId: null });
});
