import { expect, test } from '@playwright/test';
import { TOAST_MS } from '../src/lib/shell/toast.ts';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Toast is a polite status for about four seconds', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);
	const region = page.getByRole('status');
	await expect(region).toHaveAttribute('aria-live', 'polite');

	await page.getByRole('main').getByLabel('Add cover').setInputFiles({ name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
	const toast = region.filter({ hasText: "That file isn't an image" });
	await expect(toast).toBeVisible();

	const shown = Date.now();
	await expect(toast).toBeHidden({ timeout: 7000 });
	const lasted = Date.now() - shown;
	expect(lasted).toBeGreaterThan(3000);
	expect(lasted).toBeLessThan(5500);
});

test('Scenario: Toast survives a redirect', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, `/folders/${folders[0]}`);
	// the upload answers only after the person has left the folder page
	await page.route(`**/api/folders/${folders[0]}/cover`, async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 600));
		await route.fulfill({ status: 500, body: 'nope' });
	});

	const sent = page.waitForRequest(`**/api/folders/${folders[0]}/cover`);
	await page.getByRole('main').getByLabel('Add cover').setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('png') });
	await sent;
	await page.getByRole('link', { name: 'Home' }).first().click();
	await page.waitForURL((url) => url.pathname === '/');

	const toast = page.getByRole('status').filter({ hasText: "Couldn't upload — try again" });
	await expect(toast).toBeVisible();
	const shown = Date.now();
	expect(new URL(page.url()).pathname).toBe('/');

	// a full page load drops the in-memory store; the toast comes back from sessionStorage, for the time it had left
	// (about 4 s from when it first showed), not for a fresh 4 s
	await page.waitForTimeout(2000);
	await page.goto(`/folders/${folders[0]}`);
	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
	await expect(toast).toBeVisible();
	await expect(toast).toBeHidden({ timeout: 4000 });
	const gone = Date.now() - shown;
	expect(gone).toBeGreaterThan(TOAST_MS - 500);
	expect(gone).toBeLessThan(TOAST_MS + 1200);
});

test('Regression: blocked site data leaves the app and its toasts working', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.addInitScript(() => {
		Object.defineProperty(window, 'sessionStorage', {
			get() {
				throw new DOMException('The operation is insecure.', 'SecurityError');
			}
		});
	});
	await open(page, `/folders/${folders[0]}`);

	await page.getByRole('main').getByLabel('Add cover').setInputFiles({ name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
	await expect(page.getByRole('status').filter({ hasText: "That file isn't an image" })).toBeVisible();
	expect(errors).toEqual([]);
});
