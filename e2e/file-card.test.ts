import { expect, test, type Locator, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, counts, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { dropFiles } from './media-helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });
const PDF = Buffer.from('%PDF-1.4\n%%EOF\n');

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Dateien', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	return { id: notes[0], saves };
}

// the type badge is drawn by CSS from the kind, so what the user sees is the pseudo-element
const badge = (icon: Locator) => icon.evaluate((el) => getComputedStyle(el, '::before').content);

const dropPdf = (page: Page) => dropFiles(page, [{ name: 'Mietvertrag Köln.pdf', mime: 'application/pdf', buffer: PDF }]);

test('Scenario: Drop a file to insert a file card', async ({ page, request }) => {
	const { id, saves } = await openEmptyNote(page, request);

	await dropPdf(page);

	const card = editor(page).getByRole('link');
	await expect(card).toContainText('Mietvertrag Köln.pdf');
	await expect(card).toContainText(`${PDF.length} B`);
	await expect(card.getByRole('img', { name: 'PDF file' })).toBeVisible();
	expect(await badge(card.getByRole('img', { name: 'PDF file' }))).toBe('"PDF"');
	await saves.settled();
	const node = ((await storedNote(request, id))!.content.content ?? []).find((b: JSONContent) => b.type === 'fileCard');
	expect(node?.attrs).toMatchObject({ id: expect.any(Number), name: 'Mietvertrag Köln.pdf', size: PDF.length, mime: 'application/pdf' });
});

test('Scenario: Insert a file with the slash command', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/file');
	const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menu(page).getByRole('option', { name: 'File' }).click()]);
	await chooser.setFiles({ name: 'notizen.txt', mimeType: 'text/plain', buffer: Buffer.from('Hallo') });

	await expect(editor(page).getByRole('link')).toContainText('notizen.txt');
	await expect(editor(page)).not.toContainText('/file');
});

test('Scenario: File card opens in a new tab', async ({ page, request }) => {
	await openEmptyNote(page, request);
	await dropPdf(page);
	const card = editor(page).getByRole('link');
	await expect(card).toBeVisible();

	const id = (await card.getAttribute('href'))!.match(/\/files\/(\d+)/)![1];
	// headless chromium has no PDF viewer and downloads instead, so the new tab's URL stays empty; its request shows where it went
	await  await Promise.all([
		page.waitForEvent('popup'),
		page.context().waitForEvent('request', (req) => new URL(req.url()).pathname === `/files/${id}`),
		card.click()
	]);
	const res = await request.get(`/files/${id}`);
	expect(res.headers()['content-type']).toContain('application/pdf');
	expect(res.headers()['content-disposition']).toMatch(/^inline/);
});

test('Scenario: Oversized file is refused in the editor', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await dropFiles(page, [{ name: 'riesig.bin', mime: 'application/octet-stream', size: 17 * 1024 * 1024 }]);

	await expect(page.getByText('Files can be up to 16 MB', { exact: true })).toBeVisible();
	await expect(editor(page).getByRole('link').or(editor(page).getByRole('status', { name: 'Uploading' }))).toHaveCount(0);
	expect((await counts(request)).files).toBe(0);
});

test('A text file card shows a different type icon than a PDF card', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await dropFiles(page, [{ name: 'notizen.txt', mime: 'text/plain', buffer: Buffer.from('Hallo') }]);

	const icon = editor(page).getByRole('link').getByRole('img', { name: 'Text file' });
	await expect(icon).toBeVisible();
	expect(await badge(icon)).toBe('"TXT"');
});
