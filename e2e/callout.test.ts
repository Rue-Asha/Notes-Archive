import { expect, test, type Page } from '@playwright/test';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });
const picker = (page: Page) => page.getByRole('dialog', { name: 'Choose an emoji' });

test('Scenario: Callout shows an emoji and a tinted panel', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Hinweise', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	await page.keyboard.type('/callout');
	await menu(page).getByRole('option', { name: 'Callout', exact: true }).click();
	await page.keyboard.type('Nicht vergessen');
	const callout = editor(page).getByRole('note');
	await expect(callout.getByRole('button', { name: 'Change emoji' })).toHaveText('💡');

	await callout.getByRole('button', { name: 'Change emoji' }).click();
	await picker(page).getByRole('button', { name: 'pushpin', exact: true }).click();
	await expect(picker(page)).toBeHidden();

	await expect(callout.getByRole('button', { name: 'Change emoji' })).toHaveText('📌');
	await expect(callout).toContainText('Nicht vergessen');
	const panel = await callout.evaluate((el) => getComputedStyle(el).backgroundColor);
	const wash = await page.evaluate(() => {
		const probe = document.createElement('div');
		probe.style.backgroundColor = 'var(--accent-wash)';
		document.body.append(probe);
		const color = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return color;
	});
	expect(panel).toBe(wash);

	await saves.settled();
	const node = (await storedNote(request, notes[0]))!.content.content![0];
	expect(node.type).toBe('callout');
	expect(node.attrs?.emoji).toBe('📌');
	expect(node.content![0].content![0].text).toBe('Nicht vergessen');
});

test('Turn into Callout wraps the block', async ({ page, request }, info) => {
	await reset(request);
	const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Merken' }] }] };
	const { notes } = await seed(request, { notes: [{ title: 'Umwandeln', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const block = editor(page).getByText('Merken', { exact: true });
	const handle = page.getByRole('button', { name: 'Block actions' });
	if (info.project.name === 'phone') {
		await block.click();
		await handle.tap();
	} else {
		await block.hover();
		await handle.click();
	}
	await page.getByRole('menuitem', { name: 'Turn into' }).click();
	await page.getByRole('menu', { name: 'Turn into' }).getByRole('menuitem', { name: 'Callout' }).click();

	await expect(editor(page).getByRole('note')).toContainText('Merken');
	await saves.settled();
	const node = (await storedNote(request, notes[0]))!.content.content![0];
	expect([node.type, node.attrs?.emoji, node.content![0].content![0].text]).toEqual(['callout', '💡', 'Merken']);
});
