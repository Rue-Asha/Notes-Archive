import type { Id } from '#lib/types.ts';

export type PinnedOutcome = 'saved' | 'stale' | 'failed';

export async function savePinnedOrder(ids: Id[]): Promise<PinnedOutcome> {
	try {
		const res = await fetch('/api/pinned', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids }) });
		if (res.ok) return 'saved';
		return res.status === 409 ? 'stale' : 'failed';
	} catch {
		return 'failed';
	}
}

export function moved<T>(list: T[], from: number, to: number): T[] {
	const next = [...list];
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}

export interface Reorder {
	canUp: boolean;
	canDown: boolean;
	up(): void;
	down(): void;
}
