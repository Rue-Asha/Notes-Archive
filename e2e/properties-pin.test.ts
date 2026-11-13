import { expect, test } from '@playwright/test';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

test('Scenario: Pin from the properties row', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	const props = page.getByRole('group', { name: 'Properties' });
	await expect(props.getByRole('button', { name: 'Folder' })).toBeVisible();
	const pinned = props.getByRole('switch', { name: 'Pinned' });
	await expect(pinned).toHaveAttribute('aria-checked', 'false');
	await pinned.click();
	await expect(pinned).toHaveAttribute('aria-checked', 'true');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.pinnedAt).not.toBeNull();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(page.getByRole('group', { name: 'Properties' }).getByRole('switch', { name: 'Pinned' })).toHaveAttribute('aria-checked', 'true');

	await page.getByRole('group', { name: 'Properties' }).getByRole('switch', { name: 'Pinned' }).click();
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.pinnedAt).toBeNull();
});

test('Scenario: Pin from the note menu', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Pin', exact: true }).click();
	await expect(page.getByRole('group', { name: 'Properties' }).getByRole('switch', { name: 'Pinned' })).toHaveAttribute('aria-checked', 'true');
	await saves.settled();
	expect((await storedNote(request, notes[0]))!.pinnedAt).not.toBeNull();
	await page.getByRole('button', { name: 'Note menu' }).click();
	await expect(page.getByRole('menuitem', { name: 'Unpin' })).toBeVisible();
});
