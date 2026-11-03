import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';

const specimen = '/__mockups/primitives';
const result = (page: Page) => page.locator('[data-result]');

test('Scenario: Dialog traps focus and cancels on Escape', async ({ page }) => {
	await calm(page);
	await open(page, specimen);

	const opener = page.getByRole('button', { name: 'Open dialog' });
	await opener.click();
	const dialog = page.getByRole('dialog', { name: 'Delete this note?' });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

	for (let i = 0; i < 5; i++) {
		await page.keyboard.press('Tab');
		expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
	}
	await page.keyboard.press('Shift+Tab');
	expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(result(page)).toHaveText('cancelled');
	await expect(opener).toBeFocused();
});

test('Scenario: Dialog confirm runs the action and a danger dialog uses the danger button', async ({ page }) => {
	await calm(page);
	await open(page, specimen);

	await page.getByRole('button', { name: 'Open danger dialog' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete this note?' });
	const confirm = dialog.getByRole('button', { name: 'Delete' });
	await expect(confirm).toHaveClass(/danger/);
	await confirm.click();
	await expect(dialog).toBeHidden();
	await expect(result(page)).toHaveText('confirmed');
});

test('Scenario: Menu keys skip disabled items', async ({ page }) => {
	await calm(page);
	await open(page, specimen);

	const opener = page.getByRole('button', { name: 'Open menu' });
	await opener.click();
	const menu = page.getByRole('menu', { name: 'Actions' });
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('menuitem', { name: 'Rename' })).toBeFocused();
	await expect(menu.getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute('aria-disabled', 'true');

	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitem', { name: 'Move' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitem', { name: 'Rename' })).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
	await page.keyboard.press('Home');
	await expect(menu.getByRole('menuitem', { name: 'Rename' })).toBeFocused();

	await menu.getByRole('menuitem', { name: 'Duplicate' }).click({ force: true });
	await expect(result(page)).toHaveText('');
	await expect(menu).toBeVisible();

	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(menu).toBeHidden();
	await expect(result(page)).toHaveText('selected Move');
});

test('Scenario: Menu closes on Escape and returns focus', async ({ page }) => {
	await calm(page);
	await open(page, specimen);

	const opener = page.getByRole('button', { name: 'Open menu' });
	await opener.click();
	const menu = page.getByRole('menu', { name: 'Actions' });
	await expect(menu).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(opener).toBeFocused();

	await opener.click();
	await expect(menu).toBeVisible();
	await page.mouse.click(5, 5);
	await expect(menu).toBeHidden();
});

for (const side of ['drawer', 'bottom sheet', 'full sheet']) {
	test(`Scenario: Sheet (${side}) closes on back`, async ({ page }) => {
		await calm(page);
		await open(page, specimen);
		const url = page.url();

		await page.getByRole('button', { name: `Open ${side}` }).click();
		const sheet = page.getByRole('dialog', { name: `Specimen ${side}` });
		await expect(sheet).toBeVisible();

		await page.goBack();
		await expect(sheet).toBeHidden();
		expect(page.url()).toBe(url);
		await expect(result(page)).toHaveText('closed');
	});
}

test('Scenario: Sheet closes on Escape and leaves no extra history entry', async ({ page }) => {
	await calm(page);
	await open(page, specimen);
	const url = page.url();

	const opener = page.getByRole('button', { name: 'Open drawer' });
	await opener.click();
	const sheet = page.getByRole('dialog', { name: 'Specimen drawer' });
	await expect(sheet).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(sheet).toBeHidden();
	await expect(opener).toBeFocused();
	expect(page.url()).toBe(url);

	await page.goBack();
	await expect(page).not.toHaveURL(url);
});
