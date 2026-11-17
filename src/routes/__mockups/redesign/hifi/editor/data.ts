import type { MockBlock, MockData } from '../../fixtures.ts';

export const LANGUAGES = ['Plain text', 'Bash', 'C', 'C++', 'C#', 'CSS', 'Diff', 'Go', 'HTML', 'Java', 'JavaScript', 'JSON', 'Kotlin', 'Markdown', 'PHP', 'Python', 'Ruby', 'Rust', 'SQL', 'Swift', 'TypeScript', 'YAML'];
export const EMOJI = ['💡', '📌', '⚠️', '✅', '❓', '🔥', '📝', '🚆', '🧳', '📚', '🌿', '⭐'];
export const COLOURS = ['stone', 'clay', 'ochre', 'moss', 'sea', 'plum'] as const;

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

export type Token = [kind: 'plain' | 'comment' | 'keyword' | 'string' | 'number', text: string];
const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'export', 'new', 'class', 'await', 'async']);
const PIECE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;

// a small stand-in for the editor's highlighter: four roles, plain text for the rest
export function highlight(code: string): Token[][] {
	return code.split('\n').map((line) => {
		const out: Token[] = [];
		let last = 0;
		for (const m of line.matchAll(PIECE)) {
			if (m.index > last) out.push(['plain', line.slice(last, m.index)]);
			const kind = m[1] ? 'comment' : m[2] ? 'string' : m[3] ? 'number' : KEYWORDS.has(m[4]) ? 'keyword' : 'plain';
			out.push([kind, m[0]]);
			last = m.index + m[0].length;
		}
		if (last < line.length) out.push(['plain', line.slice(last)]);
		return out;
	});
}

export const SAMPLE_CODE = '// Does the pass pay off?\nconst legs = [14170, 1520, 14170];\nconst pass = 50000;\nconsole.log(sum(legs) < pass ? "singles" : "pass");';
