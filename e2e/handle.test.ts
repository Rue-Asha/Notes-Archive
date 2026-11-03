import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';
import { pasteFiles, png } from './media-helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
const handle = (page: Page) => page.getByRole('button', { name: 'Block actions' });

const paragraph = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });

async function openThree(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [paragraph('Eins'), paragraph('Zwei'), paragraph('Drei')] };
	const { notes } = await seed(request, { notes: [{ title: 'Reihenfolge', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	return { id: notes[0], saves };
}

test('Scenario: Hovering a block shows the handle', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop only');
	await openThree(page, request);
	await expect(handle(page)).toBeHidden();

	const second = body(page).getByText('Zwei');
	await second.hover();

	await expect(handle(page)).toBeVisible();
	await expect
		.poll(async () => {
			const h = (await handle(page).boundingBox())!;
			const p = (await second.boundingBox())!;
			return h.x + h.width <= p.x && h.y < p.y + p.height && h.y + h.height > p.y;
		})
		.toBe(true);
});

test('Scenario: Dragging the handle moves the block', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'drag is desktop only');
	const { id, saves } = await openThree(page, request);

	await body(page).getByText('Drei').hover();
	await expect(handle(page)).toBeVisible();
	const grip = (await handle(page).boundingBox())!;
	const first = (await body(page).getByText('Eins').boundingBox())!;
	await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
	await page.mouse.down();
	await page.mouse.move(first.x + 1, first.y + first.height / 2, { steps: 12 });

	await expect(page.locator('.prosemirror-dropcursor-block')).toBeVisible();
	await page.mouse.up();

	await expect(body(page).locator('p')).toHaveText(['Drei', 'Eins', 'Zwei']);
	await saves.settled();
	const { content } = (await storedNote(request, id))!;
	expect(content.content?.map((n) => n.content?.[0]?.text)).toEqual(['Drei', 'Eins', 'Zwei']);
});

test('The handle sits beside the cursor block on touch', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch placement');
	await openThree(page, request);

	await body(page).getByText('Zwei').click();

	await expect(handle(page)).toBeVisible();
	await expect
		.poll(async () => {
			const h = (await handle(page).boundingBox())!;
			const p = (await body(page).getByText('Zwei').boundingBox())!;
			return Math.abs(h.y - p.y) < p.height && h.x >= p.x + p.width;
		})
		.toBe(true);
});

test('The handle shows beside a tapped divider and opens its block menu on touch', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch placement');
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [paragraph('Eins'), { type: 'horizontalRule' }, paragraph('Drei')] };
	const { notes } = await seed(request, { notes: [{ title: 'Trenner', content }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	await body(page).locator('hr').click();

	await expect(handle(page)).toBeVisible();
	await handle(page).tap();
	await page.getByRole('menu', { name: 'Block menu' }).getByRole('menuitem', { name: 'Delete' }).click();
	await expect(body(page).locator('hr')).toHaveCount(0);
	await expect(body(page).locator('p')).toHaveText(['Eins', 'Drei']);
});

test('The handle shows beside a tapped image on touch', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'touch placement');
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Bild', body: '' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await body(page).click();
	await pasteFiles(page, [{ name: 'a.png', mime: 'image/png', buffer: await png() }]);
	const figure = body(page).locator('figure.image-block');
	await expect(figure.locator('img')).toHaveAttribute('src', /^\/images\/\d+$/);

	await figure.locator('img').click();

	await expect(figure).toHaveClass(/ProseMirror-selectednode/);
	await expect(handle(page)).toBeVisible();
	await expect
		.poll(async () => {
			const h = (await handle(page).boundingBox())!;
			const f = (await figure.boundingBox())!;
			return h.y >= f.y - 4 && h.y < f.y + f.height;
		})
		.toBe(true);
});
