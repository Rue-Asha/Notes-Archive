import { expect, test } from '@playwright/test';
import { calm, open } from './helpers.ts';

test('Scenario: The app uses the picked look', async ({ page }) => {
	await calm(page);
	await open(page, '/');

	const html = page.locator('html');
	await expect(html).toHaveAttribute('data-accent', 'bronze');
	await expect(html).toHaveAttribute('data-glass', 'clear');
	await expect(html).toHaveAttribute('data-card', 'glass');
});
