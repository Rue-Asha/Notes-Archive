import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { dropFiles, jpeg, pasteFiles, png } from './media-helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Bilder', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	return { id: notes[0], saves };
}

const blocks = (content: JSONContent): JSONContent[] => content.content ?? [];

test('Scenario: Paste an image into a note', async ({ page, request }) => {
	const { id, saves } = await openEmptyNote(page, request);

	await pasteFiles(page, [{ name: 'balkon.png', mime: 'image/png', buffer: await png(64, 48) }]);

	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
	await saves.settled();
	const image = blocks((await storedNote(request, id))!.content).find((b) => b.type === 'image');
	expect(image?.attrs).toMatchObject({ id: expect.any(Number), width: 64, height: 48 });
	expect(`/images/${image?.attrs?.id}`).toBe(await img.getAttribute('src'));
});

test('a dropped image shows up in an empty note', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await dropFiles(page, [{ name: 'ausblick.jpg', mime: 'image/jpeg', buffer: await jpeg(80, 60) }]);

	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
});

test('Scenario: Drop an image into a note', async ({ page, request }) => {
	await reset(request);
	const paragraph = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });
	const content: JSONContent = { type: 'doc', content: [paragraph('Eins'), paragraph('Zwei'), paragraph('Drei')] };
	const { notes } = await seed(request, { notes: [{ title: 'Bilder', content }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	const zwei = (await editor(page).getByText('Zwei').boundingBox())!;

	await dropFiles(page, [{ name: 'ausblick.jpg', mime: 'image/jpeg', buffer: await jpeg(80, 60) }], { x: zwei.x + 4, y: zwei.y + zwei.height / 2 });

	const img = editor(page).getByRole('figure').getByRole('presentation');
	await expect(img).toHaveAttribute('src', /^\/images\/\d+$/);
	const [eins, drei, at] = await Promise.all([
		editor(page).getByText('Eins').boundingBox(),
		editor(page).getByText('Drei').boundingBox(),
		img.boundingBox()
	]);
	expect(at!.y).toBeGreaterThan(eins!.y);
	expect(at!.y).toBeLessThan(drei!.y);
});

test('Scenario: Insert an image with the slash command', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/image');
	await expect(menu(page).getByRole('option', { name: 'Image' })).toBeVisible();
	const [chooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		menu(page).getByRole('option', { name: 'Image' }).click()
	]);
	await chooser.setFiles({ name: 'wohnzimmer.png', mimeType: 'image/png', buffer: await png(32, 32) });

	await expect(editor(page).getByRole('figure').getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(editor(page)).not.toContainText('/image');
});
