import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

test('Scenario: Note page shows icon, title and body', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', icon: '🌿', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page.getByRole('button', { name: 'Change icon' })).toHaveText('🌿');
	const title = page.getByRole('heading', { level: 1 }).getByRole('textbox', { name: 'Title' });
	await expect(title).toHaveValue('Garten');
	const paragraph = editor(page).getByRole('paragraph');
	await expect(paragraph).toHaveText('Beete umgraben');
	expect((await paragraph.boundingBox())!.y).toBeGreaterThan((await title.boundingBox())!.y);
});

test('Scenario: Opening a new empty note focuses the title', async ({ page, request }) => {
	await reset(request);
	const { id } = await (await request.post('/api/notes', { data: {} })).json();
	await calm(page);
	await open(page, `/notes/${id}`);

	const title = page.getByRole('textbox', { name: 'Title' });
	await expect(title).toBeFocused();
	await expect(title).toHaveAttribute('placeholder', 'Untitled');
});

test('Scenario: Untitled note\'s tab title reads Untitled', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ body: 'Nur Text' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(page).toHaveTitle(/^Untitled/);
});

test('Scenario: Very long title wraps', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the long title is typed on phone');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: '' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const title = page.getByRole('textbox', { name: 'Title' });
	const oneLine = (await title.boundingBox())!.height;
	const long = 'Ein langer Titel über den Garten hinter dem Haus '.repeat(5).slice(0, 200);
	await title.click();
	await page.keyboard.type(long);

	await expect(title).toHaveValue(long);
	const box = (await title.boundingBox())!;
	expect(box.height).toBeGreaterThan(oneLine * 3);
	expect(box.x + box.width).toBeLessThanOrEqual(390);
	expect(await title.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Scenario: Unknown blocks render as text', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [{ title: 'Alt', content: { type: 'doc', content: [{ type: 'mysteryBlock', content: [{ type: 'text', text: 'Altes Format' }] }] } }]
	});
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await expect(editor(page).getByRole('paragraph')).toHaveText('Altes Format');
	expect(errors).toEqual([]);
});

test('missing note answers 404', async ({ request }) => {
	await reset(request);
	expect((await request.get('/notes/99999')).status()).toBe(404);
});

const props = (page: Page) => page.getByRole('group', { name: 'Properties' });

test('Scenario: Properties show under the title', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the properties open at 1280×800');
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Garten', body: 'Beete', folder: 0, tags: ['Beet'] }] });
	await calm(page);
	await page.setViewportSize({ width: 1280, height: 800 });
	await open(page, `/notes/${notes[0]}`);

	const title = await page.getByRole('textbox', { name: 'Title' }).boundingBox();
	const bar = await props(page).boundingBox();
	const body = await editor(page).boundingBox();
	expect(bar!.y).toBeGreaterThan(title!.y + title!.height - 1);
	expect(bar!.y + bar!.height).toBeLessThan(body!.y);
	await expect(props(page).getByRole('button', { name: /^Folder/ })).toBeVisible();
	await expect(props(page).getByRole('combobox', { name: 'Add a tag' })).toBeVisible();
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toBeVisible();

	const fold = props(page).getByRole('button', { name: 'Hide properties' });
	await expect(fold).toHaveAttribute('aria-expanded', 'true');
	await fold.click();
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toBeHidden();
	const unfold = props(page).getByRole('button', { name: /^Properties/ });
	await expect(unfold).toHaveAttribute('aria-expanded', 'false');
	// one control: the focus stays on it through both turns
	await expect(unfold).toBeFocused();
	await expect(unfold).not.toHaveAttribute('aria-controls');
	await page.keyboard.press('Enter');
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toBeVisible();
	await expect(fold).toBeFocused();
	await expect(fold).toHaveAttribute('aria-expanded', 'true');
	const rows = await fold.getAttribute('aria-controls');
	await expect(page.locator(`[id="${rows}"]`)).toBeVisible();
});

test('Scenario: Properties collapse into a summary on the phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone summary');
	await reset(request);
	const { notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Kyoto', body: 'Tempel', folder: 1, tags: ['Zug', 'Tempel', 'Herbst'] }]
	});
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const summary = props(page).getByRole('button', { name: /^Properties/ });
	await expect(summary).toHaveAttribute('aria-expanded', 'false');
	await expect(summary).toContainText('Reisen / Japan');
	await expect(summary).toContainText('3 tags');
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toBeHidden();
	await summary.tap();
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toBeVisible();
	await expect(props(page).getByRole('button', { name: /^Remove / })).toHaveCount(3);
});

test('Scenario: Property changes save at once', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste', body: 'Zelt' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	if ((await props(page).getByRole('switch', { name: 'Pinned' }).count()) === 0) await props(page).getByRole('button', { name: /^Properties/ }).click();

	await props(page).getByRole('button', { name: /^Folder/ }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Reisen' }).click();
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.folderId).not.toBeNull();

	const input = props(page).getByRole('combobox', { name: 'Add a tag' });
	await input.fill('Zelt');
	await input.press('Enter');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.tags).toEqual(['Zelt']);

	await props(page).getByRole('switch', { name: 'Pinned' }).click();
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.pinnedAt).not.toBeNull();
});

test('Scenario: Many tags wrap without horizontal scroll', async ({ page, request }) => {
	await reset(request);
	const tags = Array.from({ length: 40 }, (_, i) => (i % 3 === 0 ? `Gartenbau-und-Beetplanung-Nummer-${String(i).padStart(2, '0')}` : `Tag${i}`));
	const { notes } = await seed(request, { notes: [{ title: 'Viele', body: 'x', tags }] });
	await calm(page);
	await page.setViewportSize({ width: 320, height: 800 });
	await open(page, `/notes/${notes[0]}`);
	const summary = props(page).getByRole('button', { name: /^Properties/ });
	if (await summary.count()) await summary.click();

	await expect(props(page).getByRole('button', { name: /^Remove / })).toHaveCount(40);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
	const box = (await props(page).boundingBox())!;
	expect(box.x + box.width).toBeLessThanOrEqual(320);
	const rows = await props(page).getByRole('button', { name: /^Remove / }).evaluateAll((els) => new Set(els.map((el) => Math.round(el.getBoundingClientRect().top))).size);
	expect(rows).toBeGreaterThan(3);
});

test('Scenario: Long folder path stays readable in the properties', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the twelve-folder path opens on the phone');
	await reset(request);
	const names = Array.from({ length: 12 }, (_, i) => `Ebene ${i + 1}`);
	const { notes } = await seed(request, { folders: names.map((name, i) => ({ name, parent: i ? i - 1 : undefined })), notes: [{ title: 'Tief', body: 'x', folder: 11 }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const summary = props(page).getByRole('button', { name: /^Properties/ });
	await expect(summary).toContainText('Ebene 12');
	expect((await summary.boundingBox())!.height).toBeLessThan(120);
	await summary.tap();
	const folder = props(page).getByRole('button', { name: /^Folder/ });
	await expect(folder).toHaveAccessibleName(`Folder: ${names.join(' / ')}`);
	const box = (await folder.boundingBox())!;
	expect(box.x + box.width).toBeLessThanOrEqual(390);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Scenario: Note without tags shows no tag count', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone summary');
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Leer', body: 'x', folder: 0 }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const summary = props(page).getByRole('button', { name: /^Properties/ });
	await expect(summary).toContainText('Reisen');
	await expect(summary).not.toContainText(/tag/i);
});
