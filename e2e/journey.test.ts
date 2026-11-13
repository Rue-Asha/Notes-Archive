import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, counts, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { jpeg, pasteFiles, pasteText } from './media-helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });
const props = (page: Page) => page.getByRole('group', { name: 'Properties' });
const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });

const paragraph = (text?: string): JSONContent => (text ? { type: 'paragraph', content: [{ type: 'text', text }] } : { type: 'paragraph' });
const nodes = (doc: JSONContent): JSONContent[] => [doc, ...(doc.content ?? []).flatMap(nodes)];
const hasMark = (doc: JSONContent, type: string, text: string) =>
	nodes(doc).some((n) => n.text === text && n.marks?.some((m) => m.type === type));

const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

async function slash(page: Page, name: string) {
	await page.keyboard.type('/');
	await menu(page).getByRole('option', { name, exact: true }).click();
	await expect(menu(page)).toBeHidden();
}

// the new-note button on Home; the bottom bar's copy is inert while the editor has focus on phone
async function startNote(page: Page) {
	await open(page, '/');
	await page.getByRole('region', { name: /Every note/ }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
	// Enter in the title only reaches the body once the editor has mounted
	await expect(editor(page)).toBeVisible();
	return Number(new URL(page.url()).pathname.split('/').pop());
}

// the editor takes focus a tick after Enter, and keys typed in between would land in the title
async function enterBody(page: Page) {
	await page.keyboard.press('Enter');
	await expect(editor(page)).toBeFocused();
}

async function openMenuOf(page: Page, info: TestInfo, text: string) {
	const block = editor(page).getByText(text, { exact: true });
	if (info.project.name === 'phone') {
		await block.click();
		await page.getByRole('button', { name: 'Block actions' }).tap();
	} else {
		await block.hover();
		await page.getByRole('button', { name: 'Block actions' }).click();
	}
	await expect(page.getByRole('menu', { name: 'Block menu' })).toBeVisible();
}

test('Done: create a note and format it with slash, shortcuts and the bubble toolbar', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	const saves = watchSaves(page);
	const id = await startNote(page);

	await page.keyboard.type('Reiseplan Kyoto');
	await enterBody(page);
	await page.keyboard.type('/');
	await menu(page).getByRole('option', { name: 'Heading 1', exact: true }).click();
	await page.keyboard.type('Tempelrunde');
	await page.keyboard.press('Enter');
	await page.keyboard.type('- Matcha');
	await page.keyboard.press('Enter');
	await page.keyboard.press('Enter');
	await page.keyboard.press('ControlOrMeta+b');
	await page.keyboard.type('fett');
	await page.keyboard.press('ControlOrMeta+b');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Sonnenaufgang');
	await editor(page).getByText('Sonnenaufgang').dblclick({ position: { x: 10, y: 8 } });
	const toolbar = page.getByRole('toolbar', { name: 'Format' });
	await expect(toolbar).toBeVisible();
	await toolbar.getByRole('button', { name: 'Italic' }).click();

	await saves.settled();
	const note = (await storedNote(request, id))!;
	expect(note.title).toBe('Reiseplan Kyoto');
	expect(nodes(note.content).find((n) => n.type === 'heading')).toMatchObject({ attrs: { level: 1 }, content: [{ text: 'Tempelrunde' }] });
	expect(nodes(note.content).some((n) => n.type === 'bulletList')).toBe(true);
	expect(hasMark(note.content, 'bold', 'fett')).toBe(true);
	expect(hasMark(note.content, 'italic', 'Sonnenaufgang')).toBe(true);
});

test('Done: add a toggle, callout, code block, table, image, PDF and link preview', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [{ title: 'Bausteine', content: { type: 'doc', content: Array.from({ length: 8 }, () => paragraph()) } }]
	});
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	// the callout keeps a paragraph of its own at the top, so once it exists the next empty block is the second paragraph (a closed toggle hides its own)
	const emptyBlock = async (nth = 1) => {
		await editor(page).getByRole('paragraph').nth(nth).click();
		await page.waitForFunction(() => {
			const { $from } = (document.querySelector('.ProseMirror') as any).editor.state.selection;
			return $from.depth === 1 && $from.parent.type.name === 'paragraph';
		});
	};
	for (const [name, nth] of [['Toggle', 0], ['Callout', 0], ['Code', 1]] as const) {
		await emptyBlock(nth);
		await slash(page, name);
	}
	await emptyBlock();
	await pasteFiles(page, [{ name: 'tempel.jpg', mime: 'image/jpeg', buffer: await jpeg(80, 60) }]);
	await expect(editor(page).getByRole('figure').getByRole('presentation')).toHaveAttribute('src', /^\/images\/\d+$/);
	await emptyBlock();
	await pasteFiles(page, [{ name: 'Fahrplan.pdf', mime: 'application/pdf', buffer: PDF }]);
	await expect(editor(page).getByRole('link', { name: /Fahrplan\.pdf/ })).toBeVisible();
	await emptyBlock();
	await pasteText(page, 'https://garden.example/');
	await expect(editor(page).getByRole('link', { name: /Garden Notes/ })).toBeVisible();
	// the table goes last: its menu sits above it and would cover the paragraph before; the link card's description is a paragraph too
	await emptyBlock(2);
	await slash(page, 'Table');

	await saves.settled();
	const types = nodes((await storedNote(request, notes[0]))!.content).map((n) => n.type);
	for (const type of ['details', 'callout', 'codeBlock', 'image', 'fileCard', 'linkPreview', 'table']) expect(types, type).toContain(type);
});

test('Done: reorder blocks by drag on desktop and by the block menu on phone', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [{ title: 'Reihenfolge', content: { type: 'doc', content: [paragraph('Eins'), paragraph('Zwei'), paragraph('Drei')] } }]
	});
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	const handle = page.getByRole('button', { name: 'Block actions' });

	if (info.project.name === 'desktop') {
		await editor(page).getByText('Drei').hover();
		await expect(handle).toBeVisible();
		const grip = (await handle.boundingBox())!;
		const first = (await editor(page).getByText('Eins').boundingBox())!;
		await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
		await page.mouse.down();
		await page.mouse.move(first.x + 1, first.y + first.height / 2, { steps: 12 });
		// allow-listed hook, see docs/functional-contract.md section 9
		await expect(page.locator('.prosemirror-dropcursor-block')).toBeVisible();
		await page.mouse.up();
	} else {
		await openMenuOf(page, info, 'Drei');
		await page.getByRole('menuitem', { name: 'Move up' }).click();
		await openMenuOf(page, info, 'Drei');
		await page.getByRole('menuitem', { name: 'Move up' }).click();
	}

	await expect(editor(page).getByRole('paragraph')).toHaveText(['Drei', 'Eins', 'Zwei']);
	await saves.settled();
	const { content } = (await storedNote(request, notes[0]))!;
	expect(content.content?.map((n) => n.content?.[0]?.text)).toEqual(['Drei', 'Eins', 'Zwei']);
});

test('Done: file the note in a nested folder, tag it and pin it', async ({ page, request }) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Packliste', body: 'Zelt und Matcha' }]
	});
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await props(page).getByRole('button', { name: 'Folder' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Japan' }).click();
	await expect(props(page).getByRole('button', { name: 'Folder' })).toContainText('Japan');
	const tags = props(page).getByRole('combobox', { name: 'Add a tag' });
	await tags.fill('Reise');
	await tags.press('Enter');
	await props(page).getByRole('switch', { name: 'Pinned' }).click();

	await saves.settled();
	const note = (await storedNote(request, notes[0]))!;
	expect(note).toMatchObject({ folderId: folders[1], tags: ['Reise'] });
	expect(note.pinnedAt).not.toBeNull();
	await open(page, '/');
	await expect(page.getByRole('region', { name: 'Pinned' }).getByRole('link', { name: 'Packliste' })).toBeVisible();
});

test('Done: find the note with Cmd/Ctrl+K by a word from its body', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [
			{ title: 'Packliste', body: 'Zelt, Schlafsack und Matcha für den Morgen' },
			{ title: 'Einkauf', body: 'Brot und Butter' }
		]
	});
	await calm(page);
	await open(page, '/');

	await page.keyboard.press('ControlOrMeta+k');
	await palette(page).getByRole('combobox', { name: 'Search notes' }).fill('matcha');
	const results = palette(page).getByRole('group', { name: 'Notes' }).getByRole('option');
	await expect(results).toHaveCount(1);
	await expect(results.first()).toContainText('Packliste');
	await page.keyboard.press('Enter');

	await expect(page).toHaveURL(`/notes/${notes[0]}`);
	await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Packliste');
});

test('Done: delete the note and a folder, each after a confirmation', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Packliste', body: 'Zelt', folder: 0, tags: ['Reise'] }, { title: 'Tempel', body: 'Kyoto', folder: 1 }]
	});
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('dialog', { name: /Delete/ });
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	expect(await storedNote(request, notes[0])).not.toBeNull();
	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(dialog).toContainText("Delete “Packliste”? This can't be undone.");
	await dialog.getByRole('button', { name: 'Delete' }).click();
	await expect.poll(() => storedNote(request, notes[0])).toBeNull();
	await page.waitForURL(/\/folders\/\d+$/);

	if (info.project.name === 'phone') await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	const tree = info.project.name === 'phone' ? page.getByRole('dialog', { name: 'Folders' }) : page.getByRole('navigation', { name: 'Sidebar' });
	await tree.getByRole('button', { name: 'Reisen menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const folderDialog = page.getByRole('dialog', { name: 'Delete folder' });
	await expect(folderDialog).toContainText('This deletes 1 folder and 1 note inside it');
	await folderDialog.getByRole('button', { name: 'Delete' }).click();

	await expect.poll(async () => (await counts(request)).folders).toBe(0);
	expect((await counts(request)).notes).toBe(0);
});

test('Done: reloading shows everything exactly as left', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	const saves = watchSaves(page);
	const id = await startNote(page);

	await page.keyboard.type('Kyoto im Herbst');
	await enterBody(page);
	await page.keyboard.type('# Ankunft');
	await page.keyboard.press('Enter');
	await page.keyboard.type('Der Zug kam pünktlich.');
	await page.keyboard.press('Enter');
	await slash(page, 'Callout');
	await page.keyboard.type('Tickets im Rucksack');
	await props(page).getByRole('button', { name: 'Folder' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Japan' }).click();
	const tags = props(page).getByRole('combobox', { name: 'Add a tag' });
	await tags.fill('Herbst');
	await tags.press('Enter');
	await props(page).getByRole('switch', { name: 'Pinned' }).click();
	await saves.settled();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });

	await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Kyoto im Herbst');
	await expect(editor(page).getByRole('heading', { level: 1 })).toHaveText('Ankunft');
	await expect(editor(page)).toContainText('Der Zug kam pünktlich.');
	await expect(editor(page).getByRole('note').first()).toContainText('Tickets im Rucksack');
	await expect(props(page).getByRole('button', { name: 'Folder' })).toContainText('Japan');
	await expect(props(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
	await expect(props(page).getByRole('button', { name: 'Remove Herbst' })).toBeVisible();
	await expect(props(page).getByRole('switch', { name: 'Pinned' })).toHaveAttribute('aria-checked', 'true');
	expect((await storedNote(request, id))!.title).toBe('Kyoto im Herbst');
});
