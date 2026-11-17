import { expect, test, type Page } from '@playwright/test';
import { screens, worstCase } from './a11y-seed.ts';
import { calm, clientNav, open } from './helpers.ts';

test('Scenario: No horizontal page scroll from 320 to 1920', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	const list = await screens(page, request);
	await calm(page);

	for (const width of [320, 375, 768, 1280, 1920]) {
		await page.setViewportSize({ width, height: 800 });
		for (const { name, path } of list) {
			await open(page, path);
			const wide = await page.evaluate(() => ({
				page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
				body: document.body.scrollWidth - document.documentElement.clientWidth
			}));
			expect(Math.max(wide.page, wide.body), `${name} at ${width}`).toBeLessThanOrEqual(0);
		}
	}
});

type Box = { x: number; y: number; w: number; h: number; label: string; small: boolean };

// WCAG 2.5.8: a target under 24 px passes when a 24 px circle on its centre touches no other target and no other undersized target's circle
async function undersized(page: Page): Promise<{ failures: string[]; measured: number }> {
	return page.evaluate(() => {
		const MIN = 24;
		const selector =
			'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=tab], [role=checkbox], [role=switch], [role=option], [role=treeitem], [contenteditable=true], [tabindex]:not([tabindex="-1"])';
		const boxes: (Box & { el: Element })[] = [];
		for (const el of document.querySelectorAll(selector)) {
			if (el.closest('[inert], [aria-hidden=true]') || el.matches(':disabled')) continue;
			const style = getComputedStyle(el);
			if (style.display === 'inline' || !el.checkVisibility({ checkVisibilityCSS: true })) continue;
			const r = el.getBoundingClientRect();
			if (r.width <= 1 || r.height <= 1) continue;
			const clip = el.closest('[style*="overflow"], .scroll, [data-scroll]');
			if (clip) {
				const c = clip.getBoundingClientRect();
				if (r.right < c.left || r.left > c.right || r.bottom < c.top || r.top > c.bottom) continue;
			}
			const label = `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[${el.getAttribute('role')}]` : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}" ${Math.round(r.width)}x${Math.round(r.height)} in ${el.closest('nav, main, aside, dialog, [role=menu], [role=dialog]')?.tagName.toLowerCase() ?? 'body'}`;
			boxes.push({ el, x: r.left, y: r.top, w: r.width, h: r.height, label, small: r.width < MIN || r.height < MIN });
		}
		const failures: string[] = [];
		const gap = (cx: number, cy: number, o: Box) => Math.hypot(Math.max(o.x - cx, 0, cx - (o.x + o.w)), Math.max(o.y - cy, 0, cy - (o.y + o.h)));
		for (const t of boxes) {
			if (!t.small) continue;
			const cx = t.x + t.w / 2;
			const cy = t.y + t.h / 2;
			const clash = boxes.find((o) => {
				if (o === t || o.el.contains(t.el) || t.el.contains(o.el)) return false;
				if (gap(cx, cy, o) < MIN / 2) return true;
				return o.small && Math.hypot(o.x + o.w / 2 - cx, o.y + o.h / 2 - cy) < MIN;
			});
			if (clash) failures.push(`${t.label} (near ${clash.label})`);
		}
		return { failures, measured: boxes.length };
	});
}

test('Scenario: Targets are at least 24 px', async ({ page, request }) => {
	const list = await screens(page, request);
	await calm(page);

	for (const { name, path } of list) {
		await open(page, path);
		const { failures, measured } = await undersized(page);
		expect(measured, `${name} has targets`).toBeGreaterThan(5);
		expect(failures, name).toEqual([]);
	}

	await open(page, '/');
	await page.getByRole('main').getByRole('button', { name: 'Note actions' }).first().click();
	await expect(page.getByRole('menu', { name: 'Note actions' })).toBeVisible();
	const menu = await undersized(page);
	expect(menu.measured, 'menu items are measured').toBeGreaterThan(8);
	expect(menu.failures, 'Note actions menu').toEqual([]);
});

// the caret is the indicator of an editable body or title; every other stop needs an outline, a ring or a halo on itself, a wrapper or (tree items) the row name it highlights
async function stops(page: Page, limit: number): Promise<string[]> {
	const problems: string[] = [];
	let count = 0;
	const seen = new Set<string>();
	for (let i = 0; i < limit; i++) {
		await page.keyboard.press('Tab');
		const stop = await page.evaluate(() => {
			const el = document.activeElement;
			if (!el || el === document.body) return null;
			const r = el.getBoundingClientRect();
			const label = `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`;
			const key = `${label}@${Math.round(r.x)},${Math.round(r.y + scrollY)}`;
			const editable = (el instanceof HTMLElement && el.isContentEditable) || el.closest('[data-note-title]') !== null;
			const ringed = (node: Element | null) => {
				if (!node) return false;
				const s = getComputedStyle(node);
				return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
			};
			let ring = ringed(el);
			if (!ring && el.getAttribute('role') === 'treeitem') for (const inner of el.querySelectorAll(':scope > *, :scope > * > *')) if ((ring = ringed(inner))) break;
			for (let up: Element | null = el.parentElement, depth = 0; !ring && up && depth < 3; up = up.parentElement, depth++) ring = ringed(up);
			const x0 = Math.max(r.left, 0);
			const x1 = Math.min(r.right, innerWidth);
			const y0 = Math.max(r.top, 0);
			const y1 = Math.min(r.bottom, innerHeight);
			const visible = x1 > x0 && y1 > y0;
			// covered means no sampled point inside the on-screen part reaches the element: a card taller than the screen is only partly under the bar
			const points = [0.1, 0.5, 0.9].flatMap((fx) => [0.1, 0.5, 0.9].map((fy) => [x0 + (x1 - x0) * fx, y0 + (y1 - y0) * fy]));
			const hits = visible ? points.map(([px, py]) => document.elementFromPoint(px, py)) : [];
			const hit = hits[4] ?? null;
			const covered = !visible || !hits.some((h) => h && (el.contains(h) || h.contains(el) || h.closest('label')?.contains(el)));
			const cover = hit ? `${hit.tagName.toLowerCase()}.${String(hit.className).slice(0, 30)}` : 'nothing';
			return { key, label, editable, ring, covered, cover, visible };
		});
		if (!stop) break;
		if (seen.has(stop.key)) break;
		seen.add(stop.key);
		count++;
		if (!stop.visible) problems.push(`${stop.label} took focus off screen`);
		else if (stop.covered) problems.push(`${stop.label} is covered by ${stop.cover}`);
		if (!stop.ring && !stop.editable) problems.push(`${stop.label} shows no focus indicator`);
	}
	if (count < 5) problems.push(`only ${count} tab stops reached`);
	return problems;
}

test('Scenario: Focus is visible and not obscured', async ({ page, request }) => {
	const list = await screens(page, request);
	await calm(page);

	for (const { name, path } of list) {
		await open(page, path);
		expect(await stops(page, 90), name).toEqual([]);
	}
});

test('Scenario: Landmarks are named once', async ({ page, request }) => {
	const list = await screens(page, request);
	await calm(page);

	for (const { name, path } of list) {
		await open(page, path);
		const tree = await page.locator('body').ariaSnapshot();
		const landmarks = [...tree.matchAll(/^\s*- (navigation|region|main|complementary|banner|contentinfo|search|form)\b(?: "([^"]*)")?/gm)].map(([, role, label]) => `${role} "${label ?? ''}"`);
		const twice = landmarks.filter((landmark, i) => landmarks.indexOf(landmark) !== i);
		expect(twice, `${name}: ${landmarks.join(', ')}`).toEqual([]);
	}
});

test('Scenario: Focus is not obscured by the phone bar while typing', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the bar is a phone thing');
	const list = await screens(page, request);
	await calm(page);
	await open(page, list[3].path);

	const body = page.getByLabel('Note body', { exact: true });
	await body.click();
	await page.keyboard.press('End');
	await expect(page.getByRole('navigation', { name: 'Bottom bar' })).toBeHidden();
	await page.keyboard.press('Control+End');
	const caret = await page.evaluate(() => {
		const range = getSelection()!.getRangeAt(0).getBoundingClientRect();
		return { bottom: range.bottom, height: innerHeight };
	});
	expect(caret.bottom).toBeLessThanOrEqual(caret.height);
});

// everything a transform, translate, scale or rotate could animate; opacity and colour changes are allowed
const MOVEMENT = new Set(['transform', 'translate', 'scale', 'rotate', 'offsetDistance', 'insetBlockStart', 'insetInlineStart', 'top', 'left']);

test('Scenario: Reduced motion removes movement', async ({ page, request }) => {
	await worstCase(request);
	await calm(page);
	await open(page, '/');
	await page.evaluate(() => {
		const moved = new Set<string>();
		(window as unknown as { moved: Set<string> }).moved = moved;
		const sample = (list: Animation[]) => {
			for (const animation of list) {
				const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
				for (const frame of (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? []) {
					for (const property of Object.keys(frame)) moved.add(`${property}|${(animation as CSSTransition).transitionProperty ?? (animation as CSSAnimation).animationName ?? 'waapi'}|${target?.tagName.toLowerCase()}.${String(target?.className ?? '').slice(0, 30)}`);
				}
			}
		};
		const tick = () => {
			sample(document.getAnimations());
			requestAnimationFrame(tick);
		};
		tick();
		document.addEventListener('animationstart', () => sample(document.getAnimations()), true);
	});

	const pinned = page.getByRole('main').getByRole('region', { name: 'Pinned' });
	await pinned.getByRole('button', { name: 'Note actions' }).first().click();
	await expect(page.getByRole('menu', { name: 'Note actions' })).toBeVisible();
	const saved = page.waitForRequest((req) => new URL(req.url()).pathname === '/api/pinned' && req.method() === 'PUT');
	await page.getByRole('menuitem', { name: 'Move down' }).click();
	await saved;
	await page.waitForTimeout(400);

	await clientNav(page, '/folders');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('main').getByRole('link').first().click();
	await page.waitForTimeout(400);
	await clientNav(page, '/search?q=notiz');
	await page.waitForTimeout(400);

	const moving = await page.evaluate(() => [...(window as unknown as { moved: Set<string> }).moved].filter((entry) => entry));
	expect(moving.filter((entry) => MOVEMENT.has(entry.split('|')[0]))).toEqual([]);
});
