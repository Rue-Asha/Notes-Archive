import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotePatch } from '#lib/types.ts';
import { createAutosave, DEBOUNCE_MS, type AutosaveOptions } from './autosave.ts';

const ok = () => new Response(JSON.stringify({ updatedAt: '2026-11-02T10:00:00.000Z', tags: [] }), { status: 200 });
const status = (code: number) => new Response(JSON.stringify({ error: 'x' }), { status: code });
const doc = (text: string) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

function deferred() {
	let resolve!: (res: Response) => void;
	const promise = new Promise<Response>((r) => (resolve = r));
	return { promise, resolve };
}

function setup(send: AutosaveOptions['send'] = vi.fn(async () => ok())) {
	const options = { send: vi.fn(send), onsaved: vi.fn(), onfailed: vi.fn(), ondeleted: vi.fn() };
	return { ...options, saver: createAutosave(options) };
}

const sentPatches = (send: ReturnType<typeof vi.fn>) => send.mock.calls.map((c) => c[0] as NotePatch);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('autosave', () => {
	it('merges typed changes and sends them once the typing pauses', async () => {
		const { saver, send } = setup();
		saver.change({ title: 'G' });
		await vi.advanceTimersByTimeAsync(300);
		saver.change({ title: 'Garten' });
		saver.change({ content: doc('Beete') });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
		expect(send).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(sentPatches(send)).toEqual([{ title: 'Garten', content: doc('Beete') }]);
	});

	it('walks idle, pending, saving and saved', async () => {
		const reply = deferred();
		const { saver } = setup(() => reply.promise);
		expect(get(saver.state)).toBe('idle');
		saver.change({ title: 'A' });
		expect(get(saver.state)).toBe('pending');
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(get(saver.state)).toBe('saving');
		expect(saver.busy).toBe(true);
		reply.resolve(ok());
		await vi.advanceTimersByTimeAsync(0);
		expect(get(saver.state)).toBe('saved');
		expect(saver.busy).toBe(false);
	});

	it('sends icon, folder, tags and pin at once, with whatever typing is pending', async () => {
		const { saver, send } = setup();
		saver.change({ title: 'Einkauf' });
		saver.change({ pinned: true });
		await vi.advanceTimersByTimeAsync(0);
		expect(sentPatches(send)).toEqual([{ title: 'Einkauf', pinned: true }]);
		for (const patch of [{ icon: '🌿' }, { folderId: 3 }, { tags: ['Garten'] }]) {
			saver.change(patch);
			await vi.advanceTimersByTimeAsync(0);
			expect(sentPatches(send).at(-1)).toEqual(patch);
		}
	});

	it('keeps one request in flight and sends what changed meanwhile merged after it', async () => {
		const first = deferred();
		const { saver, send } = setup(vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(ok()));
		saver.change({ icon: '🌿' });
		saver.change({ icon: '📚' });
		saver.change({ pinned: true });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(send).toHaveBeenCalledTimes(1);
		first.resolve(ok());
		await vi.advanceTimersByTimeAsync(0);
		expect(sentPatches(send)).toEqual([{ icon: '🌿' }, { icon: '📚', pinned: true }]);
		expect(get(saver.state)).toBe('saved');
	});

	it('flush sends pending typing without waiting for the pause', async () => {
		const { saver, send } = setup();
		saver.change({ title: 'Wort' });
		await saver.flush();
		expect(sentPatches(send)).toEqual([{ title: 'Wort' }]);
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it('keeps a failed patch, reports the failure once and retries it with the next change', async () => {
		const { saver, send, onfailed } = setup(
			vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(status(500)).mockResolvedValue(ok())
		);
		saver.change({ title: 'Eins' });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(get(saver.state)).toBe('error');
		expect(saver.busy).toBe(true);

		saver.change({ content: doc('Zwei') });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(get(saver.state)).toBe('error');
		expect(onfailed).toHaveBeenCalledTimes(1);

		await saver.flush();
		expect(get(saver.state)).toBe('saved');
		expect(sentPatches(send).at(-1)).toEqual({ title: 'Eins', content: doc('Zwei') });
	});

	it('lets a change made during a failing request win over the failed one', async () => {
		const first = deferred();
		const { saver, send } = setup(vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(ok()));
		saver.change({ title: 'Gar' });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		saver.change({ title: 'Garten' });
		first.resolve(status(500));
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(sentPatches(send).at(-1)).toEqual({ title: 'Garten' });
	});

	it('stops for good when the server says the note is gone', async () => {
		const { saver, send, ondeleted } = setup(async () => status(404));
		saver.change({ title: 'Weg' });
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(get(saver.state)).toBe('deleted');
		expect(ondeleted).toHaveBeenCalledTimes(1);
		saver.change({ title: 'Weg doch' });
		saver.change({ pinned: true });
		await saver.flush();
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
		expect(send).toHaveBeenCalledTimes(1);
		expect(saver.busy).toBe(false);
	});

	it('hands each saved patch and the answer to onsaved', async () => {
		const { saver, onsaved } = setup();
		saver.change({ tags: ['Garten'] });
		await vi.advanceTimersByTimeAsync(0);
		expect(onsaved).toHaveBeenCalledWith({ tags: ['Garten'] }, { updatedAt: '2026-11-02T10:00:00.000Z', tags: [] });
	});
});
