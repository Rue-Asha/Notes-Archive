import { describe, expect, it } from 'vitest';
import { relativeTime } from './time.ts';

const now = new Date('2026-11-02T12:00:00.000Z');
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
const S = 1000;
const M = 60 * S;
const H = 60 * M;
const D = 24 * H;

describe('relativeTime', () => {
	it('Scenario: Edited time reads relative', () => {
		expect(relativeTime(ago(30 * S), now)).toBe('just now');
		expect(relativeTime(ago(5 * M), now)).toBe('5m ago');
		expect(relativeTime(ago(2 * H), now)).toBe('2h ago');
		expect(relativeTime(ago(3 * D), now)).toBe('3d ago');
		expect(relativeTime(ago(40 * D), now)).toBe('23 Sep');
	});

	it('adds the year for another year and treats the future as just now', () => {
		expect(relativeTime('2025-03-05T10:00:00.000Z', now)).toBe('5 Mar 2025');
		expect(relativeTime(ago(-5 * M), now)).toBe('just now');
	});
});
