import { expect, test } from '@playwright/test';
import { accents, base, glasses } from '../src/lib/styles/tokens.ts';
import { calm, open } from './helpers.ts';

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

test('Scenario: Call to action is a dark pill with a round arrow', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/components');

	const cta = page.locator('[data-cta]').first();
	await expect(cta).toBeVisible();
	const style = await cta.evaluate((el) => {
		const s = getComputedStyle(el);
		const arrow = el.querySelector('.arrow')!;
		const a = arrow.getBoundingClientRect();
		return {
			background: s.backgroundColor,
			radius: parseFloat(s.borderTopLeftRadius),
			arrowRadius: parseFloat(getComputedStyle(arrow).borderTopLeftRadius),
			arrowSquare: Math.abs(a.width - a.height) < 1,
			arrowIcon: arrow.querySelector('svg') !== null
		};
	});

	expect(style.background).toBe(rgb(base.ink));
	expect(style.radius).toBeGreaterThanOrEqual(900);
	expect(style.arrowSquare).toBe(true);
	expect(style.arrowRadius).toBeGreaterThanOrEqual(900);
	expect(style.arrowIcon).toBe(true);
});

test('Scenario: Eyebrow is small tracked uppercase', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/components');

	const style = await page.locator('.eyebrow').first().evaluate((el) => {
		const s = getComputedStyle(el);
		return { transform: s.textTransform, size: parseFloat(s.fontSize), tracking: parseFloat(s.letterSpacing) / parseFloat(s.fontSize) };
	});

	expect(style.transform).toBe('uppercase');
	expect(style.size).toBeLessThanOrEqual(12);
	expect(style.tracking).toBeGreaterThanOrEqual(0.15);
});

test('Scenario: Switching the look is a data change', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/components?accent=slate&glass=frosted&card=paper');

	const html = page.locator('html');
	await expect(html).toHaveAttribute('data-accent', 'slate');
	await expect(html).toHaveAttribute('data-glass', 'frosted');
	await expect(html).toHaveAttribute('data-card', 'paper');

	const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
	expect(accent.toLowerCase()).toBe(accents.slate.accent.toLowerCase());
	// reduced motion still runs 1 ms transitions, so the computed value settles a frame later
	await expect
		.poll(() => page.locator('[data-glass-sample]').evaluate((el) => getComputedStyle(el).backdropFilter))
		.toBe(glasses.frosted['glass-filter']);
	await expect
		.poll(() => page.locator('[data-card-current]').evaluate((el) => getComputedStyle(el).backgroundColor))
		.toBe(rgb(base.surface));
});

test('components page shows the glass strengths and the three card styles side by side', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/components');

	await expect(page.locator('[data-strength]')).toHaveCount(3);
	await expect(page.locator('[data-card-sample]')).toHaveCount(3);
	await expect(page.locator('[data-chip]').first()).toBeVisible();
});
