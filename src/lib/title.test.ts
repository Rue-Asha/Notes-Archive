import { describe, expect, it } from 'vitest';
import { titleLine } from './title.ts';

describe('titleLine', () => {
	it('Scenario: Single-line contexts collapse line breaks', () => {
		expect(titleLine('Reise\n\nPlan')).toBe('Reise Plan');
		expect(titleLine('Reise\r\nPlan')).toBe('Reise Plan');
		expect(titleLine('')).toBe('Untitled');
		expect(titleLine(' \n ')).toBe('Untitled');
	});
});
