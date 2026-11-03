import { writable } from 'svelte/store';

export const TOAST_MS = 4000;
export const STORAGE_KEY = 'notes-archive:toasts';

export type ToastTone = 'info' | 'error';

interface Queued {
	message: string;
	tone: ToastTone;
}

export interface ToastItem extends Queued {
	id: number;
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// A message waits in the queue (sessionStorage when there is one) until a host is mounted, so one raised just
// before a redirect, even a full page load, shows on the page the redirect lands on.
export function createToaster(storage: Store | null, ms = TOAST_MS) {
	const toasts = writable<ToastItem[]>([]);
	let waiting: Queued[] = [];
	let hosts = 0;
	let next = 0;

	const read = (): Queued[] => (storage ? JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]') : waiting);
	function write(list: Queued[]) {
		if (!storage) waiting = list;
		else if (list.length) storage.setItem(STORAGE_KEY, JSON.stringify(list));
		else storage.removeItem(STORAGE_KEY);
	}

	function dismiss(id: number) {
		toasts.update((list) => list.filter((t) => t.id !== id));
	}

	function flush() {
		const queued = read();
		if (!queued.length) return;
		write([]);
		for (const item of queued) {
			const id = ++next;
			toasts.update((list) => [...list, { id, ...item }]);
			setTimeout(() => dismiss(id), ms);
		}
	}

	function toast(message: string, tone: ToastTone = 'info') {
		write([...read(), { message, tone }]);
		if (hosts) flush();
	}

	function attach(): () => void {
		hosts++;
		flush();
		return () => void hosts--;
	}

	return { toasts: { subscribe: toasts.subscribe }, toast, flush, dismiss, attach };
}

export const { toasts, toast, flush, dismiss, attach } = createToaster(typeof window === 'undefined' ? null : sessionStorage);
