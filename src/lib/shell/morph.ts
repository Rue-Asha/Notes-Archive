import type { OnNavigate } from '$app/navigation';
import { noteName, reducedMotion } from '#lib/motion.ts';
import type { Id } from '#lib/types.ts';

const NOTE_PATH = /^\/notes\/(\d+)\/?$/;

function noteId(path: string): Id | null {
	const match = NOTE_PATH.exec(new URL(path, 'http://local').pathname);
	return match ? Number(match[1]) : null;
}

// A card morphs into its note and back; note → note and anything else is an ordinary page transition.
export function morphTarget(from: string, to: string): { id: Id; direction: 'forward' | 'back' } | null {
	const source = noteId(from);
	const target = noteId(to);
	if ((source === null) === (target === null)) return null;
	return target !== null ? { id: target, direction: 'forward' } : { id: source!, direction: 'back' };
}

// a note can show twice on one page (Pinned and Recently edited): the card that was clicked morphs, not the first match
let clicked: Element | null = null;
if (typeof document !== 'undefined') document.addEventListener('click', (event) => (clicked = event.target instanceof Element ? event.target : null), true);

export function pageTransition({ from, to, complete }: OnNavigate): Promise<void> | void {
	if (!document.startViewTransition) return;

	const target = from && to && !reducedMotion() ? morphTarget(from.url.pathname, to.url.pathname) : null;
	const name = target && noteName(target.id);
	const source = clicked?.closest<HTMLElement>(`[data-morph="${name}"]`);
	const find = () => (name ? (source?.isConnected ? source : document.querySelector<HTMLElement>(`[data-morph="${name}"]`)) : null);
	const named: HTMLElement[] = [];
	const claim = () => {
		const el = find();
		if (el) {
			el.style.viewTransitionName = name!;
			named.push(el);
		}
	};

	claim();
	return new Promise((resolve) => {
		const transition = document.startViewTransition(async () => {
			resolve();
			await complete;
			claim();
		});
		transition.finished.finally(() => {
			for (const el of named) el.style.viewTransitionName = '';
		});
	});
}
