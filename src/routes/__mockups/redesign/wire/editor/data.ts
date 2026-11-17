import type { MockBlock, MockData } from '../../fixtures.ts';

export const LANGUAGES = ['Plain text', 'Bash', 'C', 'C++', 'C#', 'CSS', 'Diff', 'Go', 'HTML', 'Java', 'JavaScript', 'JSON', 'Kotlin', 'Markdown', 'PHP', 'Python', 'Ruby', 'Rust', 'SQL', 'Swift', 'TypeScript', 'YAML'];
export const EMOJI = ['💡', '📌', '⚠️', '✅', '❓', '🔥', '📝', '🚆', '🧳', '📚', '🌿', '⭐'];

const URL_WORD = 'https://example.org/archive/2026/11/a-very-long-address-that-has-no-break-points-at-all?utm_source=notes&utm_medium=paste&utm_campaign=quarterly-review';

export function pick<T extends MockBlock['type']>(blocks: MockBlock[], type: T): Extract<MockBlock, { type: T }> {
	return blocks.find((b) => b.type === type) as Extract<MockBlock, { type: T }>;
}

export function wideTable(worst: boolean): MockBlock {
	if (!worst) return { type: 'table', rows: [['Day', 'Plan', 'Cost'], ['1', 'Arrive', '60 €'], ['2', 'Museums', '45 €']] };
	const head = ['Day', 'Plan', 'Place', 'Transport', 'Booking reference', 'Hotel', 'Contact', 'Notes', 'Cost (EUR)', 'Paid'];
	const row = (n: number) => [String(n), 'Museum island and the long walk along the river', 'Donaudampfschifffahrtsgesellschaftskapitänslieder', 'Regional train RE1', 'BK-2026-11-0042-AX', 'Hotel near the central station', 'bartholomew.fitzgerald@northwind-industries.example.com', 'Tickets are valid for one day only', '1.284,00', 'Yes'];
	return { type: 'table', rows: [head, row(1), row(2), row(3)] };
}

export function stressBlocks(data: MockData): MockBlock[] {
	if (!data.worst) return [];
	return [
		{ type: 'paragraph', text: URL_WORD },
		{ type: 'bulletList', items: [URL_WORD, 'עברית ו東京 mixed with English in one list item that keeps going for a while'] },
		{ type: 'code', text: 'const veryLongLine = "' + 'x'.repeat(120) + '";\nconsole.log(veryLongLine);' }
	];
}
