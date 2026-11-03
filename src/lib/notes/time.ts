import type { IsoDateTime } from '#lib/types.ts';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Months are spelled out here because Intl's en-GB abbreviation changed between ICU versions ("Sep" / "Sept").
export function relativeTime(iso: IsoDateTime, now: Date = new Date()): string {
	const then = new Date(iso);
	const age = now.getTime() - then.getTime();
	if (age < MINUTE) return 'just now';
	if (age < HOUR) return `${Math.floor(age / MINUTE)}m ago`;
	if (age < DAY) return `${Math.floor(age / HOUR)}h ago`;
	if (age < 30 * DAY) return `${Math.floor(age / DAY)}d ago`;
	const date = `${then.getDate()} ${MONTHS[then.getMonth()]}`;
	return then.getFullYear() === now.getFullYear() ? date : `${date} ${then.getFullYear()}`;
}
