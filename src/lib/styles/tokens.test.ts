import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	ACCENT_TOKENS,
	BASE_TOKENS,
	CARD_TOKENS,
	GLASS_TOKENS,
	SCALE_GROUPS,
	accents,
	base,
	cards,
	glasses,
	glassText,
	largePairs,
	scale,
	textPairs,
	wide
} from './tokens.ts';
import { LOOK, lookAttrs } from './look.ts';

interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

function parse(value: string): Rgba {
	if (value.startsWith('#')) {
		const n = parseInt(value.slice(1), 16);
		return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
	}
	const m = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
	if (!m) throw new Error(`not a colour: ${value}`);
	return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

function channel(c: number): number {
	const s = c / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

const luminance = ({ r, g, b }: Rgba) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function contrast(a: Rgba, b: Rgba): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function over(top: Rgba, under: Rgba): Rgba {
	const mix = (t: number, u: number) => t * top.a + u * (1 - top.a);
	return { r: mix(top.r, under.r), g: mix(top.g, under.g), b: mix(top.b, under.b), a: 1 };
}

const ground = parse(base.ground);
const groundDeep = parse(base['ground-deep']);
const white = parse('#FFFFFF');
const black = parse('#000000');

function colour(accent: keyof typeof accents, name: string): Rgba {
	const set = { ...base, ...accents[accent] } as Record<string, string>;
	const c = parse(set[name]);
	// translucent washes sit on the page ground
	return c.a < 1 ? over(c, ground) : c;
}

const source = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const queries = source.slice(source.indexOf('@media'));
// the @media wrappers would hide their inner blocks from the matcher below, and their :root would merge into the base
const css = source.replace(/@media[^{]*\{\s*:root\s*\{[^{}]*\}\s*\}/g, '');
const blocks = [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map((m) => ({
	selectors: m[1].split(',').map((s) => s.trim()),
	decls: Object.fromEntries(
		[...m[2].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2].replace(/\s+/g, ' ').trim()])
	)
}));
const block = (selector: string) =>
	Object.assign({}, ...blocks.filter((b) => b.selectors.includes(selector)).map((b) => b.decls));

describe('tokens', () => {
	it('Scenario: Token set is complete', () => {
		const names = ['ground', 'surface', 'line', 'ink', 'ink-2', 'danger', 'danger-soft', 'on-danger'];
		for (const name of names) expect(base, name).toHaveProperty(name);
		for (const name of ['stone', 'clay', 'ochre', 'moss', 'sea', 'plum']) expect(base, name).toHaveProperty(`text-${name}`);
		for (const name of ['comment', 'keyword', 'string', 'number', 'title', 'attr']) expect(base, name).toHaveProperty(`syntax-${name}`);
		expect(Object.keys(base).sort()).toEqual([...BASE_TOKENS].sort());
		expect(Object.keys(accents).sort()).toEqual(['bronze', 'moss', 'slate']);
		for (const [name, set] of Object.entries(accents)) expect(Object.keys(set).sort(), name).toEqual([...ACCENT_TOKENS].sort());
		expect(Object.keys(glasses).sort()).toEqual(['clear', 'frosted', 'soft']);
		for (const [name, set] of Object.entries(glasses)) expect(Object.keys(set).sort(), name).toEqual([...GLASS_TOKENS].sort());
		expect(Object.keys(cards).sort()).toEqual(['glass', 'outline', 'paper']);
		for (const [name, set] of Object.entries(cards)) expect(Object.keys(set).sort(), name).toEqual([...CARD_TOKENS].sort());
		for (const group of SCALE_GROUPS) expect(Object.keys(scale[group]).length, group).toBeGreaterThan(2);
		for (const name of ['pill']) expect(scale.radius, name).toHaveProperty(`r-${name}`);
		expect(scale.easing).toHaveProperty('ease-out');
	});

	it('mirrors tokens.css', () => {
		expect(block(':root')).toMatchObject({ ...base, ...scale.radius, ...scale.space, ...scale.type, ...scale.duration, ...scale.easing });
		for (const [name, set] of Object.entries(accents)) expect(block(`[data-accent='${name}']`), name).toEqual(set);
		const defaults = block(':root');
		expect(defaults).toMatchObject({ ...accents.bronze, ...glasses.clear, ...cards.glass });
		for (const [name, set] of Object.entries(glasses)) expect(block(`[data-glass='${name}']`), name).toEqual(set);
		for (const [name, set] of Object.entries(cards)) expect(block(`[data-card='${name}']`), name).toEqual(set);
		const desktop = queries.slice(queries.indexOf('@media (min-width: 1024px)'));
		for (const [name, value] of Object.entries(wide)) expect(desktop, name).toContain(`--${name}: ${value};`);
	});

	it('has no dark scheme', () => {
		expect(css).not.toMatch(/prefers-color-scheme|data-scheme|color-scheme:\s*dark/);
		expect(css).toMatch(/color-scheme:\s*light/);
	});

	it('Scenario: Text contrast meets AA', () => {
		for (const accent of Object.keys(accents) as (keyof typeof accents)[])
			for (const [text, background] of textPairs)
				expect(contrast(colour(accent, text), colour(accent, background)), `${accent}: ${text} on ${background}`).toBeGreaterThanOrEqual(4.5);
		for (const accent of Object.keys(accents) as (keyof typeof accents)[])
			for (const text of ['ink', 'ink-2', 'accent', 'danger', ...BASE_TOKENS.filter((t) => /^(text|syntax)-/.test(t))] as const)
				expect(contrast(colour(accent, text), groundDeep), `${accent}: ${text} on ground-deep`).toBeGreaterThanOrEqual(4.5);
		for (const accent of Object.keys(accents) as (keyof typeof accents)[])
			for (const [text, background] of largePairs)
				expect(contrast(colour(accent, text), colour(accent, background)), `${accent}: ${text} on ${background}`).toBeGreaterThanOrEqual(3);
	});

	it('Scenario: Text on glass meets AA', () => {
		for (const [name, set] of Object.entries(glasses)) {
			const fill = parse(set['glass-fill']);
			const fallback = parse(set['glass-fallback']);
			expect(fallback.a, `${name} fallback is solid`).toBe(1);
			for (const text of glassText) {
				for (const [under, label] of [[white, 'white'], [black, 'black'], [ground, 'ground'], [groundDeep, 'ground-deep']] as const)
					expect(contrast(parse(base[text]), over(fill, under)), `${name} ${text} over ${label}`).toBeGreaterThanOrEqual(4.5);
				expect(contrast(parse(base[text]), fallback), `${name} ${text} on fallback`).toBeGreaterThanOrEqual(4.5);
			}
		}
	});

	it('Scenario: Text on the smoked tile meets AA', () => {
		const tile = parse(base['tile-bg']);
		for (const text of ['tile-ink', 'tile-ink-2'] as const)
			for (const [under, label] of [[white, 'white'], [groundDeep, 'ground-deep']] as const)
				expect(contrast(parse(base[text]), over(tile, under)), `${text} over ${label}`).toBeGreaterThanOrEqual(4.5);
	});

	it('look attributes', () => {
		expect(LOOK).toEqual({ accent: 'bronze', glass: 'clear', card: 'glass' });
		expect(lookAttrs()).toBe(`data-accent="bronze" data-glass="clear" data-card="glass"`);
		expect(lookAttrs({ accent: 'slate', glass: 'frosted', card: 'paper' })).toBe(`data-accent="slate" data-glass="frosted" data-card="paper"`);
		expect(lookAttrs({ accent: 'slate' })).toBe(`data-accent="slate" data-glass="clear" data-card="glass"`);
	});
});
