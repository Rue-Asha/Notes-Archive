import { afterEach, describe, expect, it, vi } from 'vitest';
import { morphTarget, pageTransition } from './morph.ts';

describe('morphTarget', () => {
	it('morphs from a list page into a note', () => {
		expect(morphTarget('/folders/3', '/notes/12')).toEqual({ id: 12, direction: 'forward' });
		expect(morphTarget('/', '/notes/7')).toEqual({ id: 7, direction: 'forward' });
	});

	it('reverses when leaving a note', () => {
		expect(morphTarget('/notes/12', '/folders/3')).toEqual({ id: 12, direction: 'back' });
		expect(morphTarget('/notes/12', '/tags/1')).toEqual({ id: 12, direction: 'back' });
	});

	it('ignores query strings and trailing slashes', () => {
		expect(morphTarget('/search?q=a', '/notes/4/')).toEqual({ id: 4, direction: 'forward' });
	});

	it('needs exactly one side to be a note', () => {
		expect(morphTarget('/notes/1', '/notes/2')).toBeNull();
		expect(morphTarget('/notes/1', '/notes/1')).toBeNull();
		expect(morphTarget('/folders/1', '/tags/2')).toBeNull();
		expect(morphTarget('/notes/abc', '/')).toBeNull();
	});
});

function fakeDom(withTransitions: boolean) {
	const make = () => ({ style: { viewTransitionName: '' } });
	const old = make();
	const next = make();
	let page: 'old' | 'new' = 'old';
	const names: string[] = [];
	const doc: Record<string, unknown> = {
		querySelector: (selector: string) => {
			names.push(selector);
			return page === 'old' ? old : next;
		}
	};
	let finish!: () => void;
	const startViewTransition = vi.fn((update: () => Promise<void>) => {
		void update();
		return {
			finished: new Promise<void>((resolve) => (finish = resolve))
		};
	});
	if (withTransitions) doc.startViewTransition = startViewTransition;
	vi.stubGlobal('document', doc);
	// Kit resolves `complete` once the new page is in the DOM
	const complete = Promise.resolve().then(() => {
		page = 'new';
	});
	return { old, next, startViewTransition, names, complete, finish: () => finish() };
}

const navigation = (from: string, to: string, complete: Promise<void>) =>
	({ from: { url: new URL(from, 'http://x') }, to: { url: new URL(to, 'http://x') }, complete }) as never;

afterEach(() => vi.unstubAllGlobals());

describe('pageTransition', () => {
	it('navigates plainly without View Transitions', () => {
		const dom = fakeDom(false);
		expect(pageTransition(navigation('/', '/tags/1', dom.complete))).toBeUndefined();
		expect(dom.names).toEqual([]);
	});

	it('runs a View Transition and names nothing for an ordinary navigation', async () => {
		const dom = fakeDom(true);
		await pageTransition(navigation('/', '/tags/1', dom.complete));

		expect(dom.startViewTransition).toHaveBeenCalledOnce();
		expect(dom.names).toEqual([]);
	});

	it('names the old element before the transition, the new one after the page swaps, and clears both', async () => {
		const dom = fakeDom(true);
		await pageTransition(navigation('/folders/1', '/notes/9', dom.complete));

		expect(dom.old.style.viewTransitionName).toBe('note-9');
		expect(dom.next.style.viewTransitionName).toBe('');
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		expect(dom.next.style.viewTransitionName).toBe('note-9');

		dom.finish();
		await Promise.resolve();
		await Promise.resolve();
		expect(dom.old.style.viewTransitionName).toBe('');
		expect(dom.next.style.viewTransitionName).toBe('');
	});

	it('names nothing under reduced motion', async () => {
		vi.stubGlobal('matchMedia', () => ({ matches: true }));
		const dom = fakeDom(true);
		await pageTransition(navigation('/folders/1', '/notes/9', dom.complete));

		expect(dom.startViewTransition).toHaveBeenCalledOnce();
		expect(dom.names).toEqual([]);
		expect(dom.old.style.viewTransitionName).toBe('');
	});
});
