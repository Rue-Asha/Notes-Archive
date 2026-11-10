import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('Scenario: Harness is declared in AGENTS.md', () => {
	const md = readFileSync('AGENTS.md', 'utf8');
	const section = md.split(/^## /m).find((s) => s.startsWith('Harness'));

	expect(section).toBeDefined();
	for (const line of [
		'- proof: `npm run proof`',
		'- proof-full: `npm run proof:full`',
		'- run: `npm run dev` → http://localhost:5173',
		'- package: `npm run package`',
		'- ship: ask',
		'- release: none'
	])
		expect(section).toContain(line);
});
