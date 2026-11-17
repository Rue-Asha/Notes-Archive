import type { MockCard } from '../../fixtures.ts';

const NOW = Date.UTC(2026, 10, 14, 12, 0);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PINNED_CONFLICT = 'Pinned order changed elsewhere — reloaded';
export const SAVE_FAILED = 'Couldn’t save — try again';

// just now, 5m ago, 2h ago, 3d ago, then "12 Mar"
export function relTime(iso: string): string {
	const then = new Date(iso);
	const minutes = Math.round((NOW - then.getTime()) / 60000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
	if (minutes < 60 * 24 * 30) return `${Math.floor(minutes / 1440)}d ago`;
	const date = `${then.getUTCDate()} ${MONTHS[then.getUTCMonth()]}`;
	return then.getUTCFullYear() === 2026 ? date : `${date} ${then.getUTCFullYear()}`;
}

// worst case: the first entry carries five tags so "+2" shows
export function withWorstTags(cards: MockCard[], worst: boolean): MockCard[] {
	return cards.map((card, i) => (worst && i === 0 ? { ...card, tags: ['draft', 'idea', 'reference', 'later', 'archive'] } : card));
}

export const initial = (title: string) => Array.from(title.trim())[0]?.toUpperCase() ?? 'U';
export const noteCount = (n: number) => `${n.toLocaleString('en-GB')} ${n === 1 ? 'note' : 'notes'}`;
