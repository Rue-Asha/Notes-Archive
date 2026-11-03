import { writable, type Readable } from 'svelte/store';
import type { IsoDateTime, NotePatch, SaveState, TagRef } from '#lib/types.ts';

export const DEBOUNCE_MS = 600;

// typed fields wait for a pause; a click on an icon, folder, tag or pin goes out at once
const DISCRETE: (keyof NotePatch)[] = ['icon', 'folderId', 'tags', 'pinned'];

export interface Saved {
	updatedAt: IsoDateTime;
	tags: TagRef[];
}

export interface AutosaveOptions {
	send(patch: NotePatch, keepalive: boolean): Promise<Response>;
	onsaved?(patch: NotePatch, saved: Saved): void;
	// the first failure after a good save; later ones stay quiet until a save goes through again
	onfailed?(): void;
	ondeleted?(): void;
	delay?: number;
}

export interface Autosave {
	state: Readable<SaveState>;
	readonly busy: boolean;
	change(patch: NotePatch): void;
	flush(keepalive?: boolean): Promise<void>;
	stop(): void;
}

export function createAutosave({ send, onsaved, onfailed, ondeleted, delay = DEBOUNCE_MS }: AutosaveOptions): Autosave {
	const state = writable<SaveState>('idle');
	let pending: NotePatch = {};
	let timer: ReturnType<typeof setTimeout> | undefined;
	let inFlight: Promise<void> | null = null;
	let failing = false;
	let stopped = false;

	const set = (next: SaveState) => state.set(next);
	const hasPending = () => Object.keys(pending).length > 0;

	function change(patch: NotePatch) {
		if (stopped) return;
		pending = { ...pending, ...patch };
		if (!inFlight) set('pending');
		clearTimeout(timer);
		if (Object.keys(patch).some((key) => DISCRETE.includes(key as keyof NotePatch))) void flush();
		else timer = setTimeout(() => void flush(), delay);
	}

	async function request(sent: NotePatch, keepalive: boolean) {
		try {
			const res = await send(sent, keepalive);
			if (res.status === 404) {
				stop();
				set('deleted');
				ondeleted?.();
				return;
			}
			if (!res.ok) throw new Error(`save answered ${res.status}`);
			const saved = (await res.json()) as Saved;
			failing = false;
			onsaved?.(sent, saved);
			set(hasPending() ? 'pending' : 'saved');
		} catch {
			if (stopped) return;
			pending = { ...sent, ...pending };
			set('error');
			if (!failing) onfailed?.();
			failing = true;
		}
	}

	// one request at a time: whatever changed meanwhile goes out, merged, once the one in flight answers
	async function flush(keepalive = false): Promise<void> {
		clearTimeout(timer);
		timer = undefined;
		while (inFlight) await inFlight;
		if (stopped || !hasPending()) return;
		const sent = pending;
		pending = {};
		set('saving');
		inFlight = request(sent, keepalive).finally(() => (inFlight = null));
		await inFlight;
	}

	function stop() {
		stopped = true;
		clearTimeout(timer);
		pending = {};
	}

	return {
		state: { subscribe: state.subscribe },
		get busy() {
			return hasPending() || inFlight !== null;
		},
		change,
		flush,
		stop
	};
}
