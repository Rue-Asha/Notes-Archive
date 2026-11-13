import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const handle = (page: Page) => page.getByRole('button', { name: 'Block actions' });
const menu = (page: Page) => page.getByRole('menu', { name: 'Block menu' });

const paragraph = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });

async function openThree(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [paragraph('Eins'), paragraph('Zwei'), paragraph('Drei')] };
	const { notes } = await seed(request, { notes: [{ title: 'Reihenfolge', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	const texts = async () => {
		await saves.settled();
		const { content } = (await storedNote(request, notes[0]))!;
		return content.content!.map((n) => n.content?.[0]?.text ?? n.content?.[0]?.content?.[0]?.text);
	};
	const stored = async () => {
		await saves.settled();
		return (await storedNote(request, notes[0]))!.content.content!;
	};
	return { texts, stored };
}

// the handle shows on hover with a mouse and next to the cursor's block on phone
async function openMenu(page: Page, info: TestInfo, text: string) {
	const block = editor(page).getByText(text, { exact: true });
	if (info.project.name === 'phone') {
		await block.click();
		await handle(page).tap();
	} else {
		await block.hover();
		await handle(page).click();
	}
	await expect(menu(page)).toBeVisible();
}

test('Scenario: Block menu moves a block up and down', async ({ page, request }, info) => {
	const { texts } = await openThree(page, request);

	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Move up' }).click();
	expect(await texts()).toEqual(['Zwei', 'Eins', 'Drei']);

	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Move down' }).click();
	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Move down' }).click();
	expect(await texts()).toEqual(['Eins', 'Drei', 'Zwei']);
});

test("Scenario: First and last blocks can't move past the edge", async ({ page, request }, info) => {
	await openThree(page, request);

	await openMenu(page, info, 'Eins');
	await expect(menu(page).getByRole('menuitem', { name: 'Move up' })).toHaveAttribute('aria-disabled', 'true');
	await expect(menu(page).getByRole('menuitem', { name: 'Move down' })).not.toHaveAttribute('aria-disabled', 'true');
	await page.keyboard.press('Escape');
	await expect(menu(page)).toBeHidden();

	await openMenu(page, info, 'Drei');
	await expect(menu(page).getByRole('menuitem', { name: 'Move down' })).toHaveAttribute('aria-disabled', 'true');
	await expect(menu(page).getByRole('menuitem', { name: 'Move up' })).not.toHaveAttribute('aria-disabled', 'true');
});

test('Scenario: Turn a block into another type', async ({ page, request }, info) => {
	const { stored } = await openThree(page, request);

	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Turn into' }).click();
	await page.getByRole('menu', { name: 'Turn into' }).getByRole('menuitem', { name: 'Heading 1' }).click();
	await expect(editor(page).getByRole('heading', { level: 1 })).toHaveText('Zwei');
	const heading = (await stored())[1];
	expect(heading.type).toBe('heading');
	expect(heading.attrs?.level).toBe(1);

	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Turn into' }).click();
	await page.getByRole('menu', { name: 'Turn into' }).getByRole('menuitem', { name: 'Quote' }).click();
	await expect(editor(page).getByRole('blockquote')).toHaveText('Zwei');
	const quote = (await stored())[1];
	expect(quote.type).toBe('blockquote');
	expect(quote.content?.[0].content?.[0].text).toBe('Zwei');
});

test('Scenario: Delete a block from the block menu', async ({ page, request }, info) => {
	const { texts } = await openThree(page, request);

	await openMenu(page, info, 'Zwei');
	await menu(page).getByRole('menuitem', { name: 'Delete' }).click();

	await expect(editor(page).getByRole('paragraph')).toHaveText(['Eins', 'Drei']);
	expect(await texts()).toEqual(['Eins', 'Drei']);
});

test('Scenario: Tapping the handle on phone opens the block menu', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch handle');
	await openThree(page, request);

	await editor(page).getByText('Zwei').click();
	await handle(page).tap();

	for (const name of ['Move up', 'Move down', 'Turn into', 'Delete'])
		await expect(menu(page).getByRole('menuitem', { name })).toBeVisible();
});
