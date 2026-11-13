import { expect, test } from '@playwright/test';
import { calm, editor, open, reset, seed } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'phone', 'the soft keyboard only exists on touch devices');
});

test('Scenario: Bottom bar hides while typing in the editor', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Beete umgraben' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const bar = page.getByRole('navigation', { name: 'Bottom bar', includeHidden: true });
	await expect(bar).not.toHaveAttribute('aria-hidden', 'true');
	const viewport = page.viewportSize()!;
	await expect.poll(async () => (await bar.boundingBox())!.y).toBeLessThan(viewport.height);

	await editor(page).click();
	await expect(bar).toHaveAttribute('aria-hidden', 'true');
	await expect.poll(async () => (await bar.boundingBox())!.y).toBeGreaterThanOrEqual(viewport.height);

	await page.getByRole('textbox', { name: 'Title' }).click();
	await expect(bar).not.toHaveAttribute('aria-hidden', 'true');
	await expect.poll(async () => (await bar.boundingBox())!.y).toBeLessThan(viewport.height);
});
