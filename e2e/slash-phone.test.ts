import { expect, test, type Page } from '@playwright/test';
import { docFromText } from '../src/lib/editor/doc.ts';
import { calm, open, reset, seed } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
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

	await body(page).locator('p').last().click();
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

for (const motion of ['allowed', 'reduced'] as const) {
	test(`Scenario: Editor menus open with a short animation (${motion})`, async ({ page, request }) => {
		await reset(request);
		const { notes } = await seed(request, { notes: [{ title: 'Bewegung', body: '' }] });
		if (motion === 'reduced') await calm(page);
		await open(page, `/notes/${notes[0]}`);
		// the 140 ms intro is over before a poll could see it, so record what the menu asks the browser to run
		await page.evaluate(() => {
			const seen: { role: string | null; duration: number; props: string[] }[] = [];
			(window as unknown as { __animations: typeof seen }).__animations = seen;
			const animate = Element.prototype.animate;
			Element.prototype.animate = function (this: Element, keyframes, options) {
				const frames = keyframes as Keyframe[];
				seen.push({
					role: this.getAttribute('role'),
					duration: typeof options === 'number' ? options : Number(options?.duration ?? 0),
					props: Object.keys(frames[0] ?? {})
				});
				return animate.call(this, keyframes, options);
			};
		});

		await body(page).click();
		await page.keyboard.type('/');
		await expect(menu(page)).toBeVisible();

		const seen = await page.evaluate(
			() => (window as unknown as { __animations: { role: string | null; duration: number; props: string[] }[] }).__animations
		);
		const ran = seen.filter((a) => a.role === 'listbox' && a.duration > 0);
		if (motion === 'reduced') expect(ran).toEqual([]);
		else {
			expect(ran.length).toBeGreaterThan(0);
			expect(ran.every((a) => a.duration <= 160)).toBe(true);
			expect(ran.some((a) => a.props.includes('opacity') && a.props.includes('transform'))).toBe(true);
		}
	});
}
