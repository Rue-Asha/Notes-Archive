import { afterEach, describe, expect, it, vi } from 'vitest';
import { fadeSlide, hideOnOutro, noteName, pop, reducedMotion, reveal, rise, stagger } from './motion.ts';

function prefersReduced(reduce: boolean) {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: reduce && query === '(prefers-reduced-motion: reduce)',
		media: query
	}));
}

class FakeNode {
	attrs = new Map<string, string>();
	listeners = new Map<string, Set<() => void>>();
	style = { props: new Map<string, string>(), setProperty: (k: string, v: string) => this.style.props.set(k, v) };
	setAttribute(k: string, v: string) {
		this.attrs.set(k, v);
	}
	removeAttribute(k: string) {
		this.attrs.delete(k);
	}
	hasAttribute(k: string) {
		return this.attrs.has(k);
	}
	getAttribute(k: string) {
		return this.attrs.get(k) ?? null;
	}
	addEventListener(type: string, fn: () => void) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type)!.add(fn);
	}
	removeEventListener(type: string, fn: () => void) {
		this.listeners.get(type)?.delete(fn);
	}
	dispatch(type: string) {
		for (const fn of this.listeners.get(type) ?? []) fn();
	}
}

type Entry = { isIntersecting: boolean };
let observers: { cb: (entries: Entry[]) => void; targets: unknown[]; disconnected: boolean }[] = [];

function stubObserver() {
	observers = [];
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			record: (typeof observers)[number];
			constructor(cb: (entries: Entry[]) => void) {
				this.record = { cb, targets: [], disconnected: false };
				observers.push(this.record);
			}
			observe(t: unknown) {
				this.record.targets.push(t);
			}
			disconnect() {
				this.record.disconnected = true;
			}
		}
	);
}

function properties(css: string): string[] {
	return css
		.split(';')
		.map((d) => d.split(':')[0].trim())
		.filter(Boolean);
}

const node = {} as Element;
const primitives = {
	rise: () => rise(node, { delay: 80, y: 20 }),
	pop: () => pop(node),
	fadeSlide: () => fadeSlide(node, { y: 12 })
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('motion', () => {
	it('reducedMotion follows the media query and is false without matchMedia', () => {
		prefersReduced(true);
		expect(reducedMotion()).toBe(true);
		prefersReduced(false);
		expect(reducedMotion()).toBe(false);
		vi.stubGlobal('matchMedia', undefined);
		expect(reducedMotion()).toBe(false);
	});

	it('reduced motion gives zero-duration transitions', () => {
		prefersReduced(true);
		for (const [name, make] of Object.entries(primitives)) {
			const config = make();
			expect(config.duration ?? 0, name).toBe(0);
			expect(config.delay ?? 0, name).toBe(0);
		}
	});

	it('transitions animate only transform and opacity', () => {
		prefersReduced(false);
		for (const [name, make] of Object.entries(primitives)) {
			const config = make();
			expect(config.duration, name).toBeGreaterThan(0);
			for (const p of properties(config.css!(0.5, 0.5))) expect(['transform', 'opacity'], name).toContain(p);
		}
	});

	it('menus open within 160 ms', () => {
		prefersReduced(false);
		expect(fadeSlide(node).duration).toBeLessThanOrEqual(160);
	});

	it('stagger spaces entrances 30 ms apart and caps at 10', () => {
		expect([0, 1, 2, 3].map(stagger)).toEqual([0, 30, 60, 90]);
		expect(stagger(100)).toBe(stagger(10));
		expect(stagger(10)).toBe(300);
	});

	it('reveal marks the node once it intersects', () => {
		prefersReduced(false);
		stubObserver();
		const el = new FakeNode();
		const action = reveal(el as unknown as Element, { delay: 120 });

		expect(el.hasAttribute('data-reveal')).toBe(true);
		expect(el.hasAttribute('data-revealed')).toBe(false);
		expect(el.style.props.get('--stagger')).toBe('120ms');
		observers[0].cb([{ isIntersecting: false }]);
		expect(el.hasAttribute('data-revealed')).toBe(false);
		observers[0].cb([{ isIntersecting: true }]);
		expect(el.hasAttribute('data-revealed')).toBe(true);
		expect(observers[0].disconnected).toBe(true);
		action.destroy();
	});

	it('reduced motion reveals at once with no delay and without observing', () => {
		prefersReduced(true);
		stubObserver();
		const el = new FakeNode();
		reveal(el as unknown as Element, { delay: 120 }).destroy();

		expect(el.hasAttribute('data-revealed')).toBe(true);
		expect(el.hasAttribute('data-reveal')).toBe(false);
		expect(el.style.props.has('--stagger')).toBe(false);
		expect(observers).toHaveLength(0);
	});

	it('hideOnOutro toggles aria-hidden with the outro and intro', () => {
		const el = new FakeNode();
		const action = hideOnOutro(el as unknown as Element);

		el.dispatch('outrostart');
		expect(el.getAttribute('aria-hidden')).toBe('true');
		el.dispatch('introstart');
		expect(el.hasAttribute('aria-hidden')).toBe(false);
		action.destroy();
		el.dispatch('outrostart');
		expect(el.hasAttribute('aria-hidden')).toBe(false);
	});

	it('noteName names the shared card and header element', () => {
		expect(noteName(7)).toBe('note-7');
	});
});
