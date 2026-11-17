import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const OLD_FILES = [
	'src/lib/styles/tokens.css',
	'src/lib/styles/tokens.ts',
	'src/lib/styles/global.css',
	'src/lib/styles/look.ts',
	'src/lib/styles/tokens.test.ts',
	'src/lib/styles/guard.test.ts',
	'src/lib/styles/global.test.ts',
	'src/lib/mockups',
	'src/lib/shell/morph.ts',
	...['home', 'folder', 'note', 'search', 'drawer', 'components', 'primitives'].map((name) => `src/routes/__mockups/${name}`)
];

function sources(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return sources(path);
		return /\.(ts|svelte|css|html)$/.test(name) && !name.endsWith('no-old-styles.test.ts') ? [path] : [];
	});
}

it('Scenario: Old style files are gone', () => {
	for (const path of OLD_FILES) expect(existsSync(path), path).toBe(false);
	const stale = /styles\/(tokens|global|look)(\.|\/|')|lib\/mockups\/|shell\/morph|%look%/;
	for (const path of sources('src')) expect(readFileSync(path, 'utf8'), path).not.toMatch(stale);
});

it('Scenario: Proof runs check-slop without a baseline', () => {
	const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
	expect(scripts.proof.startsWith('node scripts/fingerprint/check-slop.mjs && node scripts/fingerprint/check-drift.mjs')).toBe(true);
	expect(scripts.proof).not.toMatch(/baseline/);
	expect(existsSync('scripts/slop-baseline.txt')).toBe(false);
	expect(existsSync('scripts/slop-baseline.mjs')).toBe(false);
});
