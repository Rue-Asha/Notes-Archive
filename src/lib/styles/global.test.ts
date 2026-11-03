import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { handle } from '../../hooks.server.ts';
import { lookAttrs } from './look.ts';

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function rule(selector: string, within = css): string {
	const at = within.indexOf(`${selector} {`);
	expect(at, selector).toBeGreaterThanOrEqual(0);
	return within.slice(at, within.indexOf('}', at));
}

describe('global.css', () => {
	it('Scenario: Glass falls back to a solid surface', () => {
		const start = css.indexOf('@supports not (backdrop-filter: blur(1px))');
		expect(start).toBeGreaterThanOrEqual(0);
		const fallback = css.slice(start, css.indexOf('\n}\n', start));
		expect(fallback).toContain('.glass');
		expect(fallback).toMatch(/background:\s*var\(--glass-fallback\)/);
		expect(fallback).not.toMatch(/rgb\(|rgba\(|opacity/);
	});

	it('.glass is the shared material', () => {
		const glass = rule('.glass');
		expect(glass).toContain('var(--glass-fill)');
		expect(glass).toContain('backdrop-filter: var(--glass-filter)');
		expect(glass).toContain('var(--glass-rim)');
		expect(glass).toContain('var(--glass-shadow)');
	});

	it('the look selectors reach the cards', () => {
		const card = rule('.card');
		expect(card).toContain('var(--card-bg)');
		expect(card).toContain('backdrop-filter: var(--card-filter)');
		expect(card).toContain('var(--card-border)');
		expect(card).toContain('var(--card-shadow)');
	});

	it('paints the atmosphere behind the page', () => {
		expect(rule('body::before')).toMatch(/position:\s*fixed/);
		expect(rule('body::before')).toContain('var(--atmosphere)');
	});

	it('sets the base type and the focus ring', () => {
		expect(rule('body')).toContain('font-family: var(--font-text)');
		expect(css).toMatch(/:focus-visible\s*\{[^}]*var\(--ink\)/);
		expect(css).toMatch(/\.eyebrow\s*\{[^}]*text-transform:\s*uppercase/);
		expect(css).toMatch(/\.display em\s*[,{][^}]*color:\s*var\(--accent\)/);
	});

	it('writes the look into <html>', async () => {
		let options: { transformPageChunk?: (input: { html: string; done: boolean }) => string } | undefined;
		await handle({
			event: {} as never,
			resolve: async (_event: unknown, opts?: typeof options) => {
				options = opts;
				return new Response('');
			}
		} as never);
		const html = options!.transformPageChunk!({ html: '<html lang="en" %look%><head>', done: true });
		expect(html).toBe(`<html lang="en" ${lookAttrs()}><head>`);
		expect(readFileSync(new URL('../../app.html', import.meta.url), 'utf8')).toContain('<html lang="en" %look%>');
	});
});
