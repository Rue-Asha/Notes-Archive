import { flip, type AnimationConfig } from 'svelte/animate';
import type { TransitionConfig } from 'svelte/transition';

// Motion for the things the user makes happen: a row arriving or leaving, a list making room, a menu or a dialog
// opening. Durations and curves come from the fingerprint tokens, read once from the page; only transform and opacity
// move. Under prefers-reduced-motion every one of these is instant (Rue, 2026-11-16).

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navigation stays instant: while a page change renders (and on the first load) nothing arrives, departs or reflows.
// The app layout calls hush() once a navigation commits (onNavigate) and listen() after it.
let quiet = true;
export const hush = () => (quiet = true);
export const listen = () => requestAnimationFrame(() => (quiet = false));

const tokens = new Map<string, string>();
function token(name: string): string {
	if (!tokens.has(name)) tokens.set(name, getComputedStyle(document.documentElement).getPropertyValue(name).trim());
	return tokens.get(name)!;
}

export function ms(name: string): number {
	const value = token(name);
	return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
}

// cubic-bezier(x1, y1, x2, y2) as an easing function: Newton's method on x, then y at that t
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
	const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
	return (x) => {
		if (x <= 0 || x >= 1) return x;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const d = slope(x1, x2, t);
			if (Math.abs(d) < 1e-6) break;
			t -= (at(x1, x2, t) - x) / d;
		}
		return at(y1, y2, Math.min(1, Math.max(0, t)));
	};
}

const curves = new Map<string, (t: number) => number>();
export function ease(name: string): (t: number) => number {
	if (!curves.has(name)) {
		const n = token(name).match(/-?[\d.]+/g)?.map(Number);
		curves.set(name, n?.length === 4 ? bezier(n[0], n[1], n[2], n[3]) : (t) => t);
	}
	return curves.get(name)!;
}

const still: TransitionConfig = { duration: 0 };

// A row the user just created settles in from a few pixels above. `live` stays false while the list first renders,
// so a page load or an expanded folder shows its rows at once; only rows that arrive later move.
export function arrive(node: Element, { live = true }: { live?: boolean } = {}): TransitionConfig {
	if (!live || quiet || reduced()) return still;
	return {
		duration: ms('--motion-glide'),
		easing: ease('--ease-out'),
		css: (t, u) => `opacity: ${t}; transform: translateY(${u * -6}px) scale(${0.98 + 0.02 * t})`
	};
}

// A removed row fades and shrinks a touch, faster than it came, while its neighbours close the gap.
export function depart(node: Element, { live = true }: { live?: boolean } = {}): TransitionConfig {
	if (!live || quiet || reduced()) return still;
	(node as HTMLElement).inert = true;
	return {
		duration: ms('--motion-quick'),
		easing: ease('--ease-out'),
		css: (t) => `opacity: ${t}; transform: scale(${0.98 + 0.02 * t})`
	};
}

// The rows that stay glide to their new place when one is added, removed, moved or pinned.
export function reflow(node: Element, fromTo: { from: DOMRect; to: DOMRect }, { live = true }: { live?: boolean } = {}): AnimationConfig {
	if (!live || quiet || reduced()) return still;
	return flip(node, fromTo, { duration: ms('--motion-glide'), easing: ease('--ease-in-out') });
}

// A menu or popover opens from its trigger's side: a short fade and a scale up from 0.97, out in a little less time.
// The caller sets transform-origin on the node. A closing menu is inert at once, so it can't take a second click.
export function pop(node: Element, { live = true }: { live?: boolean } = {}, options?: { direction: 'in' | 'out' | 'both' }): TransitionConfig {
	if (!live || reduced()) return still;
	const out = options?.direction === 'out';
	if (out) (node as HTMLElement).inert = true;
	return {
		duration: out ? ms('--motion-quick') * 0.75 : ms('--motion-quick'),
		easing: ease('--ease-out'),
		css: (t) => `opacity: ${t}; transform: scale(${0.97 + 0.03 * t})`
	};
}
