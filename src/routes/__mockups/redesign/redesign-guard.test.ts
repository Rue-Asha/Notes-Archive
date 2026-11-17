import { isHttpError } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockData, type MockFolder } from './fixtures.ts';
import { load } from './+layout.server.ts';

const run = () => load({} as Parameters<typeof load>[0]);

function thrown(fn: () => unknown): unknown {
	try {
		fn();
	} catch (e) {
		return e;
	}
}

const depth = (f: MockFolder): number => 1 + Math.max(0, ...f.children.map(depth));

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('/__mockups/redesign guard', () => {
	it('Scenario: Redesign mockups are hidden without the test flag', () => {
		for (const value of [undefined, '', '0', 'true']) {
			vi.stubEnv('NOTES_ARCHIVE_TEST', value);
			expect(isHttpError(thrown(run), 404), String(value)).toBe(true);
		}
		vi.stubEnv('NOTES_ARCHIVE_TEST', '1');
		expect(run).not.toThrow();
	});
});

describe('mockData', () => {
	const normal = mockData(new URL('http://x/__mockups/redesign'));
	const worst = mockData(new URL('http://x/__mockups/redesign?data=worst'));

	it('selects the worst-case set with ?data=worst', () => {
		expect(Math.max(...worst.tree.map(depth))).toBe(12);
		expect(Math.max(...normal.tree.map(depth))).toBeLessThan(12);
		expect(worst.tags.length).toBe(40);
		expect(worst.note.title.length).toBeGreaterThanOrEqual(200);
		expect(normal.note.title.length).toBeLessThan(80);
	});

	it('carries a mocked pin order and tree sort in both sets', () => {
		for (const data of [normal, worst]) {
			expect(data.pinned.length).toBeGreaterThan(1);
			expect(['mixed', 'name', 'edited', 'created']).toContain(data.sort);
		}
	});
});
