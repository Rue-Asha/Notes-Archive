import { expect, test, type Page } from '@playwright/test';
import { calm, clientNav, counts, editor, open, reset, seed, watchSaves } from './helpers.ts';
import { cutSelection, pasteClip, pasteFiles, png } from './media-helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });
const toast = (page: Page, text: string) => page.getByText(text, { exact: true });

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Bilder', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	return { id: notes[0], saves };
}

async function chooseVia(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
	await page.keyboard.type('/image');
	const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menu(page).getByRole('option', { name: 'Image' }).click()]);
	await chooser.setFiles(file);
}

test('Scenario: Image block shows at column width with a caption', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	const { id, saves } = await openEmptyNote(page, request);

	await pasteFiles(page, [{ name: 'breit.png', mime: 'image/png', buffer: await png(3000, 1200) }]);
	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

	const [imageWidth, columnWidth] = await img.evaluate((el) => {
		const parent = el.closest('figure')!.parentElement!;
		const style = getComputedStyle(parent);
		return [el.getBoundingClientRect().width, parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)];
	});
	expect(imageWidth).toBeCloseTo(columnWidth, 0);

	await editor(page).getByLabel('Caption').fill('Blick vom Balkon');
	await saves.settled();
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(editor(page).getByLabel('Caption')).toHaveValue('Blick vom Balkon');
	void id;
});

test('Scenario: Oversized or non-image upload is refused in the editor', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await chooseVia(page, { name: 'riesig.png', mimeType: 'image/png', buffer: Buffer.alloc(17 * 1024 * 1024) });
	await expect(toast(page, 'That image is too large')).toBeVisible();
	await page.keyboard.type('/image');
	const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menu(page).getByRole('option', { name: 'Image' }).click()]);
	await chooser.setFiles({ name: 'vertrag.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
	await expect(toast(page, "That file isn't an image")).toBeVisible();

	await expect(editor(page).getByRole('figure').or(editor(page).getByRole('status', { name: 'Uploading' }))).toHaveCount(0);
	expect((await counts(request)).images).toBe(0);
});

test('Scenario: Upload shows a placeholder and a failure removes it', async ({ page, request }) => {
	await openEmptyNote(page, request);
	let calls = 0;
	await page.route('**/api/notes/*/images', async (route) => {
		if (++calls === 1) {
			await new Promise((resolve) => setTimeout(resolve, 1200));
			return route.continue();
		}
		await new Promise((resolve) => setTimeout(resolve, 800));
		return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
	});

	await pasteFiles(page, [{ name: 'eins.png', mime: 'image/png', buffer: await png() }]);
	await expect(editor(page).getByRole('status', { name: 'Uploading' })).toBeVisible();
	await expect(editor(page).getByRole('figure').getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(editor(page).getByRole('status', { name: 'Uploading' })).toHaveCount(0);

	await pasteFiles(page, [{ name: 'zwei.png', mime: 'image/png', buffer: await png() }]);
	await expect(editor(page).getByRole('status', { name: 'Uploading' })).toBeVisible();
	await expect(toast(page, "Couldn't upload — try again")).toBeVisible();
	await expect(editor(page).getByRole('status', { name: 'Uploading' })).toHaveCount(0);
	await expect(editor(page).getByRole('figure')).toHaveCount(1);
});

test('Scenario: Deleting an image block releases the upload', async ({ page, request }) => {
	const { saves } = await openEmptyNote(page, request);

	await pasteFiles(page, [{ name: 'weg.png', mime: 'image/png', buffer: await png() }]);
	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	const src = (await img.getAttribute('src'))!;
	await saves.settled();
	await expect.poll(async () => (await counts(request)).images).toBe(1);

	await img.click();
	await page.keyboard.press('Backspace');
	await expect(editor(page).getByRole('figure')).toHaveCount(0);
	await saves.settled();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(editor(page).getByRole('figure')).toHaveCount(0);
	expect((await request.get(src)).status()).toBe(200);
});

test('Scenario: A cut image can be pasted into another note', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Quelle', body: '' }, { title: 'Ziel', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	await pasteFiles(page, [{ name: 'umzug.png', mime: 'image/png', buffer: await png() }]);
	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	const src = (await img.getAttribute('src'))!;
	await saves.settled();

	await img.click();
	const clip = await cutSelection(page);
	await expect(editor(page).getByRole('figure')).toHaveCount(0);
	await clientNav(page, `/notes/${notes[1]}`);
	await expect(page).toHaveTitle(/^Ziel/);
	await saves.settled();
	await editor(page).click();
	await pasteClip(page, clip);
	await expect(img).toHaveAttribute('src', src);
	await saves.settled();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(img).toHaveAttribute('src', src);
	// the page would show the picture from its immutable cache even after a 404, so the server is asked directly
	expect((await request.get(src)).status()).toBe(200);
});
