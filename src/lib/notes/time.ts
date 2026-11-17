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

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Home's kicker: "Saturday 14 November"
export function longDay(now: Date = new Date()): string {
	return `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${LONG_MONTHS[now.getMonth()]}`;
}

// a folder's note rows: "14 Nov", with the year once it is another year's
export function shortDate(iso: IsoDateTime, now: Date = new Date()): string {
	const then = new Date(iso);
	const date = `${then.getDate()} ${MONTHS[then.getMonth()]}`;
	return then.getFullYear() === now.getFullYear() ? date : `${date} ${then.getFullYear()}`;
}

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// a search hit's date: "Sat 14 Nov" (DESIGN.md, numbers and dates), with the year once it is another year's
export function dayDate(iso: IsoDateTime, now: Date = new Date()): string {
	return `${SHORT_WEEKDAYS[new Date(iso).getDay()]} ${shortDate(iso, now)}`;
}
