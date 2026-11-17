import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('Scenario: Proof runs the fingerprint guards', () => {
	const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
	const proof: string = scripts.proof;
	const slop = proof.indexOf('node scripts/fingerprint/check-slop.mjs');
	expect(proof).not.toContain('--baseline');
	const drift = proof.indexOf('node scripts/fingerprint/check-drift.mjs');
	const check = proof.indexOf('npm run check');
	expect(slop).toBeGreaterThanOrEqual(0);
	expect(drift).toBeGreaterThan(slop);
	expect(check).toBeGreaterThan(drift);
	expect(JSON.parse(readFileSync('fingerprint.lock', 'utf8')).version).toBe('2.0.0');
});

it('Scenario: Vendored files match the lock', () => {
	const drift = resolve('scripts/fingerprint/check-drift.mjs');
	expect(execFileSync('node', [drift], { encoding: 'utf8' })).toMatch(/match lock v2\.0\.0/);

	// a copy of the vendored tree, so one file can change without touching the real ones
	const lock = JSON.parse(readFileSync('fingerprint.lock', 'utf8')) as { files: Record<string, string> };
	const copy = mkdtempSync(join(tmpdir(), 'drift-'));
	try {
		cpSync('fingerprint.lock', join(copy, 'fingerprint.lock'));
		for (const file of Object.keys(lock.files)) cpSync(file, join(copy, file), { recursive: true });
		const changed = Object.keys(lock.files).find((file) => file.endsWith('.css'))!;
		writeFileSync(join(copy, changed), '/* changed */', { flag: 'a' });
		const run = spawnSync('node', [drift], { cwd: copy, encoding: 'utf8' });
		expect(run.status).toBe(1);
		expect(run.stderr).toContain(`check-drift: ${changed} changed`);
	} finally {
		rmSync(copy, { recursive: true, force: true });
	}
});
