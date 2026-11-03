import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToaster, STORAGE_KEY, TOAST_MS } from './toast.ts';

function fakeStorage() {
	const data = new Map<string, string>();
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		data
	};
}

const texts = (t: ReturnType<typeof createToaster>) => get(t.toasts).map((i) => i.message);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('toaster', () => {
	it('holds a message until a host attaches, then shows it once', () => {
		const t = createToaster(null);
		t.toast('Saved');

		expect(texts(t)).toEqual([]);
		t.attach();
		expect(texts(t)).toEqual(['Saved']);
		t.flush();
		expect(texts(t)).toEqual(['Saved']);
	});

	it('shows a message at once while a host is attached', () => {
		const t = createToaster(null);
		t.attach();
		t.toast('Deleted');

		expect(texts(t)).toEqual(['Deleted']);
	});

	it('shows queued messages in order with their own ids', () => {
		const t = createToaster(null);
		t.toast('One');
		t.toast('Two');
		t.attach();

		const items = get(t.toasts);
		expect(items.map((i) => i.message)).toEqual(['One', 'Two']);
		expect(new Set(items.map((i) => i.id)).size).toBe(2);
	});

	it('defaults to the info tone and keeps the tone it was given', () => {
		const t = createToaster(null);
		t.attach();
		t.toast('Saved');
		t.toast("Couldn't save — try again", 'error');

		expect(get(t.toasts).map((i) => i.tone)).toEqual(['info', 'error']);
	});

	it('hides each toast after 4 s', () => {
		const t = createToaster(null);
		t.attach();
		t.toast('Saved');
		vi.advanceTimersByTime(TOAST_MS - 1);

		expect(texts(t)).toEqual(['Saved']);
		vi.advanceTimersByTime(1);
		expect(texts(t)).toEqual([]);
		expect(TOAST_MS).toBe(4000);
	});

	it('dismisses one toast and leaves the others', () => {
		const t = createToaster(null);
		t.attach();
		t.toast('One');
		t.toast('Two');
		t.dismiss(get(t.toasts)[0].id);

		expect(texts(t)).toEqual(['Two']);
	});

	it('keeps the queue and tones in storage so a full page load still shows them', () => {
		const storage = fakeStorage();
		const before = createToaster(storage);
		before.toast('Saved');
		before.toast('Failed', 'error');
		expect(storage.data.has(STORAGE_KEY)).toBe(true);

		const afterReload = createToaster(storage);
		afterReload.attach();
		expect(get(afterReload.toasts).map((i) => [i.message, i.tone])).toEqual([
			['Saved', 'info'],
			['Failed', 'error']
		]);
		expect(storage.data.size).toBe(0);
	});

	it('queues again after the host detaches', () => {
		const t = createToaster(null);
		const detach = t.attach();
		detach();
		t.toast('Saved');

		expect(texts(t)).toEqual([]);
		t.attach();
		expect(texts(t)).toEqual(['Saved']);
	});
});
