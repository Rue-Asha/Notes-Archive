import { writable } from 'svelte/store';

export const TOAST_MS = 4000;
export const STORAGE_KEY = 'notes-archive:toasts';

export type ToastTone = 'info' | 'error';

interface Queued {
	message: string;
	tone: ToastTone;
	// set on a toast parked by a page unload: it shows only for the time it had left
	until?: number;
}

export interface ToastItem {
	id: number;
	message: string;
	tone: ToastTone;
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// A message waits in the queue (sessionStorage when there is one) until a host is mounted, so one raised just
// before a redirect, even a full page load, shows on the page the redirect lands on. A toast already showing when the
// page unloads is parked back in the queue with the time it had left.
export function createToaster(storage: Store | null, ms = TOAST_MS) {
	const toasts = writable<ToastItem[]>([]);
	let waiting: Queued[] = [];
	let hosts = 0;
	let next = 0;
	const showing = new Map<number, Queued & { until: number }>();

	const read = (): Queued[] => (storage ? JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]') : waiting);
	function write(list: Queued[]) {
		if (!storage) waiting = list;
		else if (list.length) storage.setItem(STORAGE_KEY, JSON.stringify(list));
		else storage.removeItem(STORAGE_KEY);
	}

	function dismiss(id: number) {
		showing.delete(id);
		toasts.update((list) => list.filter((t) => t.id !== id));
	}

	function flush() {
		const queued = read();
		if (!queued.length) return;
		write([]);
		const now = Date.now();
		for (const { message, tone, until = now + ms } of queued) {
			if (until <= now) continue;
			const id = ++next;
			showing.set(id, { message, tone, until });
			toasts.update((list) => [...list, { id, message, tone }]);
			setTimeout(() => dismiss(id), until - now);
		}
	}

	function toast(message: string, tone: ToastTone = 'info') {
		write([...read(), { message, tone }]);
		if (hosts) flush();
	}

	function park() {
		if (!showing.size) return;
		write([...read(), ...showing.values()]);
		showing.clear();
		toasts.set([]);
	}

	function attach(): () => void {
		hosts++;
		flush();
		return () => void hosts--;
	}

	return { toasts: { subscribe: toasts.subscribe }, toast, flush, dismiss, attach, park };
}

// reading sessionStorage throws a SecurityError when the browser blocks site data; the queue then lives in memory
function session(): Store | null {
	try {
		return typeof window === 'undefined' ? null : window.sessionStorage;
	} catch {
		return null;
	}
}

export const { toasts, toast, flush, dismiss, attach, park } = createToaster(session());
