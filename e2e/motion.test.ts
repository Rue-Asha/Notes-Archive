import { expect, test, type Page } from '@playwright/test';
import { COPY } from '../src/lib/copy.ts';
import { calm, editor, folderLink, isDesktop, open, reset, seed, sidebar, treeScope } from './helpers.ts';

type Seen = { tag: string; key: string | null; cls: string; duration: number; props: string[] };

// Svelte runs its transitions through element.animate(); an intro is over before a poll could see it, so the page
// records every call: which element, how long, which properties
async function record(page: Page): Promise<() => Promise<Seen[]>> {
	await page.addInitScript(() => {
		const seen: Seen[] = [];
		(window as unknown as { __seen: Seen[] }).__seen = seen;
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, keyframes, options) {
			const frames = Array.isArray(keyframes) ? keyframes : [];
			const props = [...new Set(frames.flatMap((f) => Object.keys(f ?? {})).filter((k) => !['offset', 'easing', 'composite'].includes(k)))];
			const duration = typeof options === 'number' ? options : Number(options?.duration ?? 0);
			const pinned = this.getAttribute('data-pinned-id');
			seen.push({ tag: this.tagName.toLowerCase(), key: this.getAttribute('data-key') ?? (pinned ? `p${pinned}` : null), cls: this.getAttribute('class') ?? '', duration, props });
			return animate.call(this, keyframes, options);
		};
	});
	return async () => {
		const all = await page.evaluate(() => (window as unknown as { __seen: Seen[] }).__seen.splice(0));
		return all.filter((a) => a.duration > 0);
	};
}

// Svelte starts a transition a frame after it sets the first keyframe: collect the calls until `pick` finds some
async function until(seen: () => Promise<Seen[]>, pick: (a: Seen) => boolean): Promise<Seen[]> {
	let calls: Seen[] = [];
	await expect.poll(async () => (calls = calls.concat(await seen())).filter(pick).length).toBeGreaterThan(0);
	return calls.filter(pick);
}

const moves = (a: Seen) => a.props.every((p) => p === 'opacity' || p === 'transform');

test('Scenario: A new folder arrives in the tree and its neighbours make room', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'the tree lives in the desktop sidebar');
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Beta' }, { name: 'Gamma' }] });
	const seen = await record(page);
	await open(page, '/');
	await expect.poll(async () => (await seen()).length).toBe(0);

	await sidebar(page).getByRole('button', { name: 'New folder' }).click();
	const field = sidebar(page).getByRole('textbox', { name: 'Folder name' });
	await expect(field).toBeVisible();
	const fresh = await sidebar(page).locator('li[data-key]:has(> .row input[aria-label="Folder name"])').getAttribute('data-key');
	expect(fresh).not.toBe(`f${folders[0]}`);
	expect(fresh).not.toBe(`f${folders[1]}`);
	// the new row itself settles in: a fade and a drop on transform and opacity only, within 300 ms
	const arrived = await until(seen, (a) => a.key === fresh);
	expect(arrived.every(moves)).toBe(true);
	expect(arrived.some((a) => a.props.includes('opacity') && a.props.includes('transform'))).toBe(true);
	expect(Math.max(...arrived.map((a) => a.duration))).toBeLessThanOrEqual(300);

	await field.fill('Alpha');
	await page.keyboard.press('Enter');
	await expect(folderLink(sidebar(page), 'Alpha')).toBeVisible();
	// "Alpha" sorts first, so Beta and Gamma glide down to make room, on transform only
	const glided = await until(seen, (a) => a.key === `f${folders[0]}` || a.key === `f${folders[1]}`);
	expect(glided.every(moves)).toBe(true);
	expect(glided.every((a) => a.props.includes('transform'))).toBe(true);
});

test('Scenario: The first folder arrives on an empty Folders page', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'the Folders page list is the phone place for folders');
	await reset(request);
	const seen = await record(page);
	await open(page, '/');
	const scope = await treeScope(page, info);
	await seen();

	await scope.getByRole('button', { name: 'New folder' }).first().click();
	await expect(page.getByRole('textbox', { name: 'Folder name' })).toBeVisible();
	const arrived = await until(seen, (a) => a.tag === 'li');
	expect(arrived.every(moves)).toBe(true);
});

test('Scenario: Unpinning a note on Home lets it go and the rest make room', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, {
		notes: [
			{ title: 'Erste', pinnedAt: '2026-11-01T09:00:00.000Z' },
			{ title: 'Zweite', pinnedAt: '2026-11-02T09:00:00.000Z' },
			{ title: 'Dritte', pinnedAt: '2026-11-03T09:00:00.000Z' }
		]
	});
	const seen = await record(page);
	await open(page, '/');
	await seen();

	const pinned = page.locator('[data-pinned-list]');
	const first = pinned.locator('li').first();
	const leaving = `p${await first.getAttribute('data-pinned-id')}`;
	const staying = notes.map((id) => `p${id}`).filter((key) => key !== leaving);
	await first.getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Unpin' }).click();
	await expect(pinned.locator('li')).toHaveCount(2);
	let calls: Seen[] = [];
	const collect = async () => (calls = calls.concat(await seen()));
	// the unpinned row itself fades and shrinks out, quicker than a row arrives
	await expect.poll(async () => (await collect()).filter((a) => a.key === leaving).length, 'the unpinned row departs').toBeGreaterThan(0);
	const left = calls.filter((a) => a.key === leaving);
	expect(left.every(moves)).toBe(true);
	expect(left.some((a) => a.props.includes('opacity'))).toBe(true);
	expect(Math.max(...left.map((a) => a.duration))).toBeLessThanOrEqual(200);
	// and the rows below it glide up into the gap
	await expect.poll(async () => (await collect()).filter((a) => staying.includes(a.key ?? '')).length, 'the rest make room').toBeGreaterThan(0);
	const room = calls.filter((a) => staying.includes(a.key ?? ''));
	expect(room.every((a) => a.props.includes('transform') && moves(a))).toBe(true);
});

test('Scenario: Menus and dialogs open and close softly', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Weich', body: 'Ein Satz.' }] });
	const seen = await record(page);
	await open(page, `/notes/${notes[0]}`);
	await seen();

	// Svelte starts a transition a frame after it sets the first keyframe, so collect until the call has come
	let calls: Seen[] = [];
	const pops = async () => (calls = calls.concat(await seen())).filter((a) => a.cls.includes('pop'));

	await page.getByRole('button', { name: 'Note menu' }).click();
	await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
	await expect.poll(async () => (await pops()).length, 'the menu opens softly').toBe(1);
	const [opened] = await pops();
	expect(opened.props.sort()).toEqual(['opacity', 'transform']);
	expect(opened.duration).toBeGreaterThanOrEqual(150);
	expect(opened.duration).toBeLessThanOrEqual(200);

	calls = [];
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toHaveCount(0);
	await expect.poll(async () => (await pops()).length, 'and closes softly').toBe(1);
	const [closed] = await pops();
	expect(closed.duration).toBeLessThanOrEqual(opened.duration);

	await page.getByRole('button', { name: 'Note menu' }).click();
	// sample the dialog every frame while it opens: it has to start faint and offset and end opaque and in place
	const frames = page.evaluate(
		() =>
			new Promise<{ opacity: number; transform: string }[]>((done) => {
				const out: { opacity: number; transform: string }[] = [];
				let since = 0;
				const tick = (now: number) => {
					const open = document.querySelector('dialog[data-sheet][open]');
					if (open) {
						since ||= now;
						const cs = getComputedStyle(open);
						out.push({ opacity: parseFloat(cs.opacity), transform: cs.transform });
					}
					if (since && now - since > 450) done(out);
					else requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			})
	);
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await expect(page.getByRole('alertdialog')).toBeVisible();
	const seenFrames = await frames;
	const still = (t: string) => t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
	expect(seenFrames.some((f) => f.opacity < 0.9), 'the dialog fades in').toBe(true);
	expect(seenFrames.some((f) => !still(f.transform)), 'and rises or grows into place').toBe(true);
	const last = seenFrames.at(-1)!;
	expect(last.opacity).toBe(1);
	expect(still(last.transform)).toBe(true);

	// a confirmation is answered, so it leaves at the quick speed, on a phone too
	const confirm = (await page.locator('dialog[role="alertdialog"][open]').elementHandle())!;
	await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
	await expect.poll(() => confirm.evaluate((el: HTMLDialogElement) => el.open)).toBe(false);
	const exit = await confirm.evaluate((el) => getComputedStyle(el).transitionDuration.split(',').map((d) => parseFloat(d)));
	expect(Math.max(...exit), 'the dialog closes in at most 160 ms').toBeLessThanOrEqual(0.16);
});

test('Scenario: Navigation stays instant', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Garten' }],
		notes: [
			{ title: 'Packliste', folder: 0 },
			{ title: 'Beete', folder: 1 }
		]
	});
	const seen = await record(page);
	await open(page, `/folders/${folders[0]}`);
	await seen();

	await page.getByRole('main').locator('a[href^="/notes/"]').first().waitFor();
	await page.evaluate((href) => {
		const a = document.createElement('a');
		a.href = href;
		document.body.append(a);
		a.click();
		a.remove();
	}, `/folders/${folders[1]}`);
	await page.waitForURL((url) => url.pathname === `/folders/${folders[1]}`);
	await expect(page.getByRole('main').getByText('Beete')).toBeVisible();
	expect((await seen()).filter((a) => a.tag === 'li')).toEqual([]);
});

// regression: motion used to be hushed in beforeNavigate, so a leave the note page's failed-save guard cancelled left every
// row still until the next navigation that went through
test('A cancelled navigation leaves motion on', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'the tree lives in the desktop sidebar');
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Beta' }], notes: [{ title: 'Fehler' }] });
	const seen = await record(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	await page.route(`**/api/notes/${notes[0]}`, (route) => (route.request().method() === 'PATCH' ? route.fulfill({ status: 500, body: 'down' }) : route.continue()));
	await page.keyboard.type('Wort');
	await expect(page.locator('[data-save-state]')).toHaveText(COPY.saveFailed);

	await sidebar(page).getByRole('link', { name: 'Home' }).click();
	await expect(page.locator('[data-save-state]')).toHaveText(COPY.saveFailed);
	expect(new URL(page.url()).pathname).toBe(`/notes/${notes[0]}`);
	await seen();

	await sidebar(page).getByRole('button', { name: 'New folder' }).click();
	const field = sidebar(page).getByRole('textbox', { name: 'Folder name' });
	await expect(field).toBeVisible();
	const fresh = await sidebar(page).locator('li[data-key]:has(> .row input[aria-label="Folder name"])').getAttribute('data-key');
	const arrived = await until(seen, (a) => a.key === fresh);
	expect(arrived.every(moves)).toBe(true);
});

test('Scenario: Reduced motion makes all of it instant', async ({ page, request }, info) => {
	await reset(request);
	const { notes } = await seed(request, { folders: [{ name: 'Beta' }], notes: [{ title: 'Ruhig', body: 'Ein Satz.' }] });
	const seen = await record(page);
	await calm(page);
	await open(page, '/');
	const scope = await treeScope(page, info);
	await seen();

	await scope.getByRole('button', { name: 'New folder' }).first().click();
	await expect(page.getByRole('textbox', { name: 'Folder name' })).toBeVisible();
	await page.getByRole('textbox', { name: 'Folder name' }).fill('Alpha');
	await page.keyboard.press('Enter');
	await expect(folderLink(scope, 'Alpha')).toBeVisible();

	await open(page, `/notes/${notes[0]}`);
	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog');
	await expect(dialog).toBeVisible();
	// the fingerprint floor keeps colour and opacity in the property list; every duration is zero
	const durations = await dialog.evaluate((el) => getComputedStyle(el).transitionDuration.split(',').map((d) => parseFloat(d)));
	expect(durations.every((d) => d === 0)).toBe(true);
	expect(await seen()).toEqual([]);
});
