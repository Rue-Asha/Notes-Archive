import { expect, test } from '@playwright/test';
import { editor, open, reset, seed, calm } from './helpers.ts';

test('Scenario: Native spellcheck and autocorrect stay off where text is typed', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Käse', body: 'Wir kaufen Käse und Wein.', tags: ['Käse'] }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	// the phone folds the properties, and the tag field with them
	const summary = page.getByRole('group', { name: 'Properties' }).getByRole('button', { name: /^Properties/ });
	if (await summary.count()) await summary.click();

	const fields = [page.getByLabel('Title', { exact: true }), editor(page), page.getByRole('combobox', { name: 'Add a tag' })];
	for (const field of fields) {
		await expect(field).toHaveJSProperty('spellcheck', false);
		await expect(field).toHaveAttribute('autocorrect', 'off');
	}
});
