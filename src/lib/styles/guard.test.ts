import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = fileURLToPath(new URL('../../', import.meta.url));
const tokensCss = fileURLToPath(new URL('./tokens.css', import.meta.url));

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const path = `${dir}${e.name}`;
		if (e.isDirectory()) return sourceFiles(`${path}/`);
		return /\.(svelte|css)$/.test(e.name) && path !== tokensCss ? [path] : [];
	});
}

const files = sourceFiles(srcDir).map((path) => {
	const text = readFileSync(path, 'utf8');
	const styles = path.endsWith('.css') ? [text] : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return { name: relative(srcDir, path), text, css: styles.join('\n').replace(/\/\*[\s\S]*?\*\//g, '') };
});

const namedColours = new Set(
	`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
	cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
	darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
	darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
	firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
	hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
	lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
	lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
	mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
	midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
	palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
	rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
	slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
	whitesmoke yellow yellowgreen`.split(/\s+/)
);

function declarations(css: string): { prop: string; value: string }[] {
	return [...css.matchAll(/([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)].map((m) => ({ prop: m[1], value: m[2].trim() }));
}

function colourLiterals(css: string): string[] {
	return declarations(css).flatMap(({ value }) => {
		const hex = value.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
		const functions = value.match(/\b(?:rgba?|hsla?)\(/g) ?? [];
		const words = value
			.replace(/(['"]).*?\1|url\([^)]*\)|var\(--[\w-]+/g, ' ')
			.toLowerCase()
			.match(/[a-z][a-z-]*/g);
		return [...hex, ...functions, ...(words ?? []).filter((w) => namedColours.has(w))];
	});
}

const allowed = ['transform', 'opacity', 'none'];

// every property a transition or animation names, plus the declarations inside keyframes
function animatedProperties(css: string): string[] {
	const found: string[] = [];
	for (const { prop, value } of declarations(css)) {
		if (prop === 'transition-property') found.push(...value.split(',').map((p) => p.trim()));
		if (prop === 'transition') found.push(...value.split(/,(?![^(]*\))/).map((part) => part.trim().split(/\s+/)[0]));
	}
	for (const m of css.matchAll(/@keyframes[^{]*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g))
		for (const { prop } of declarations(m[1])) if (prop !== 'animation-timing-function') found.push(prop);
	return found;
}

describe('style guards', () => {
	it('scans the sources', () => {
		expect(files.length).toBeGreaterThan(8);
	});

	it('Scenario: Components use no raw colours', () => {
		const found = files.flatMap((f) => colourLiterals(f.css).map((c) => `${f.name}: ${c}`));
		expect(found).toEqual([]);
	});

	it('Scenario: Only transform and opacity animate', () => {
		const offenders = files.flatMap((f) =>
			animatedProperties(f.css)
				.filter((p) => !allowed.includes(p))
				.map((p) => `${f.name}: ${p}`)
		);
		expect(offenders).toEqual([]);
		expect(files.flatMap((f) => (/transition\s*:\s*all\b|transition-property\s*:\s*all\b/.test(f.css) ? [f.name] : []))).toEqual([]);
		expect(files.flatMap((f) => (/clip-path/.test(f.css) ? [f.name] : []))).toEqual([]);
		// slide animates height, blur animates a filter, draw a stroke
		const imports = files.flatMap((f) =>
			[...f.text.matchAll(/import\s*\{([^}]*)\}\s*from\s*'svelte\/transition'/g)]
				.flatMap((m) => m[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]))
				.filter((n) => ['slide', 'blur', 'draw'].includes(n))
				.map((n) => `${f.name}: ${n}`)
		);
		expect(imports).toEqual([]);
	});
});
