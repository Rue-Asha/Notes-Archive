import { expect, test, type Page } from '@playwright/test';
import { docFromText } from '../src/lib/editor/doc.ts';
import { calm, editor, open, reset, seed } from './helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

test('Scenario: Slash menu stays within the visible viewport on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone viewport');
	await reset(request);
	const lines = Array.from({ length: 40 }, (_, i) => `Zeile ${i + 1} im langen Text`).join('\n');
	const { notes } = await seed(request, { notes: [{ title: 'Lang', content: docFromText(lines) }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	// the soft keyboard leaves little of the visual viewport; headless has none, so shrink the window
	await page.setViewportSize({ width: 390, height: 320 });

	await editor(page).getByRole('paragraph').last().click();
	await page.keyboard.press('ControlOrMeta+End');
	await page.keyboard.press('Enter');
	await page.keyboard.type('/');
	await expect(menu(page)).toBeVisible();

	await expect
		.poll(async () => {
			const box = (await menu(page).boundingBox())!;
			const vv = await page.evaluate(() => {
				const v = window.visualViewport!;
				return { top: v.offsetTop, left: v.offsetLeft, width: v.width, height: v.height };
			});
			return (
				box.y >= vv.top && box.x >= vv.left && box.y + box.height <= vv.top + vv.height && box.x + box.width <= vv.left + vv.width
			);
		})
		.toBe(true);
});

test('Scenario: Editor menus open without animation', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Bewegung', body: '' }] });
	await open(page, `/notes/${notes[0]}`);
	// an intro would be over before a poll could see it, so record what the menu asks the browser to run
	await page.evaluate(() => {
		const seen: (string | null)[] = [];
		(window as unknown as { __animated: typeof seen }).__animated = seen;
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, keyframes, options) {
			seen.push(this.getAttribute('role'));
			return animate.call(this, keyframes, options);
		};
	});

	await editor(page).click();
	await page.keyboard.type('/');
	await expect(menu(page)).toBeVisible();

	expect(await menu(page).evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
	const seen = await page.evaluate(() => (window as unknown as { __animated: (string | null)[] }).__animated);
	expect(seen.filter((role) => role === 'listbox')).toEqual([]);
});
