import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';

const root = 'src/routes/__mockups/redesign';
const widths = [375, 768, 1280];

// every directory with a +page.svelte, the index included
function screens(dir = ''): string[] {
	const here = existsSync(join(root, dir, '+page.svelte')) ? [dir] : [];
	const below = readdirSync(join(root, dir)).filter((name) => statSync(join(root, dir, name)).isDirectory());
	return [...here, ...below.flatMap((name) => screens(join(dir, name)))];
}

const slugs = screens();
const path = (slug: string, data: string) => `/__mockups/redesign/${slug}${data === 'worst' ? '?data=worst' : ''}`;

async function settle(page: Page) {
	await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop');
});

test('Scenario: Every mockup screen is shot at three widths', async ({ page }) => {
	test.setTimeout(300_000);
	await calm(page);
	expect(slugs.length).toBeGreaterThan(0);
	for (const slug of slugs) {
		for (const data of ['normal', 'worst']) {
			await open(page, path(slug, data));
			for (const width of widths) {
				await page.setViewportSize({ width, height: 900 });
				await settle(page);
				const name = `${slug.replaceAll('/', '-') || 'index'}-${width}-${data}`;
				const file = `test-results/shots/redesign/${name}.png`;
				await page.screenshot({ path: file, fullPage: true });
				expect(existsSync(file), file).toBe(true);
			}
		}
	}
});

test('Scenario: Worst-case data switches the fixtures', async ({ page }) => {
	await calm(page);
	await page.setViewportSize({ width: 375, height: 900 });
	for (const slug of slugs) {
		await open(page, path(slug, 'normal'));
		await expect(page.locator('[data-data]').first()).toHaveAttribute('data-data', 'normal');
		await open(page, path(slug, 'worst'));
		await expect(page.locator('[data-data]').first()).toHaveAttribute('data-data', 'worst');
		await settle(page);
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, `${slug} scrolls sideways`).toBeLessThanOrEqual(0);
	}
});
