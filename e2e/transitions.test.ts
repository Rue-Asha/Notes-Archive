import { expect, test, type Page } from '@playwright/test';
import { calm, clientNav, open, reset, seed } from './helpers.ts';

interface Spy {
	calls: number;
	named: number;
	animations: { pseudo: string; duration: number; props: string[] }[];
}

// Wraps startViewTransition before the app loads: counts calls, notes whether any note-<id> name was set when it ran,
// and records the root pseudo-element animations once the transition is ready.
function spy(page: Page) {
	return page.addInitScript(() => {
		const original = document.startViewTransition?.bind(document);
		const state: Spy = { calls: 0, named: 0, animations: [] };
		(window as unknown as { __vt: Spy }).__vt = state;
		if (!original) return;
		document.startViewTransition = ((update: () => Promise<void>) => {
			state.calls++;
			state.named += [...document.querySelectorAll<HTMLElement>('*')].filter((el) => el.style.viewTransitionName.startsWith('note-')).length;
			const transition = original(update);
			transition.ready.then(() => {
				for (const a of document.getAnimations()) {
					const effect = a.effect as KeyframeEffect;
					if (!effect.pseudoElement?.includes('(root)')) continue;
					state.animations.push({
						pseudo: effect.pseudoElement,
						duration: Number(effect.getTiming().duration),
						props: [...new Set(effect.getKeyframes().flatMap((k) => Object.keys(k)))].filter(
							(p) => !['offset', 'easing', 'composite', 'computedOffset'].includes(p)
						)
					});
				}
			}, () => {});
			return transition;
		}) as typeof document.startViewTransition;
	});
}

const read = (page: Page) => page.evaluate(() => (window as unknown as { __vt: Spy }).__vt);

async function homeToTag(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'A', tags: ['Reise'] }] });
	await open(page, '/');
	const tagHref = await page.evaluate(async () => (await (await fetch('/')).text()).match(/\/tags\/\d+/)![0]);
	await clientNav(page, tagHref);
	return notes;
}

test('Scenario: Other navigations fade', async ({ page, request }) => {
	await spy(page);
	await homeToTag(page, request);

	await expect.poll(async () => (await read(page)).animations.length).toBeGreaterThan(0);
	const vt = await read(page);
	expect(vt.calls).toBeGreaterThan(0);
	expect(vt.named).toBe(0);
	const slide = vt.animations.find((a) => a.pseudo.includes('new(root)'));
	expect(slide?.props).toContain('transform');
	expect(slide?.props).toContain('opacity');
});

test('Scenario: Reduced motion uses a short fade', async ({ page, request }) => {
	await calm(page);
	await spy(page);
	await homeToTag(page, request);

	await expect.poll(async () => (await read(page)).animations.length).toBeGreaterThan(0);
	const { animations } = await read(page);
	for (const a of animations) {
		expect(a.duration).toBeLessThanOrEqual(120);
		expect(a.props).toEqual(['opacity']);
	}
});

test('Scenario: Browser without View Transitions navigates plainly', async ({ page, request }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.addInitScript(() => {
		Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
	});
	await calm(page);
	await homeToTag(page, request);

	await expect(page).toHaveURL(/\/tags\/\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Reise' })).toBeVisible();
	await expect(page.locator('[data-note-card]')).toHaveCount(1);
	expect(errors).toEqual([]);
});
