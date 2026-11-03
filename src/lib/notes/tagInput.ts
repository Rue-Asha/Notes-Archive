import { fold } from '#lib/text.ts';
import type { TagRef } from '#lib/types.ts';

export function clean(raw: string): string {
	return raw.normalize('NFC').trim().replace(/\s+/g, ' ');
}

// the chip list after confirming `raw`: blank and duplicates (ignoring case and umlauts) change nothing,
// an existing tag keeps its stored spelling
export function addTag(selected: string[], known: TagRef[], raw: string): string[] {
	const typed = clean(raw);
	if (!typed || selected.some((s) => fold(s) === fold(typed))) return selected;
	const match = known.find((t) => fold(t.name) === fold(typed));
	return [...selected, match?.name ?? typed];
}

// a comma confirms everything before it, which also covers pasting "a, b, c"; the rest stays in the input
export function splitCommas(selected: string[], known: TagRef[], text: string): { selected: string[]; rest: string } {
	if (!text.includes(',')) return { selected, rest: text };
	const parts = text.split(',');
	const rest = parts.pop() ?? '';
	return { selected: parts.reduce((all, part) => addTag(all, known, part), selected), rest };
}

export function suggest(known: TagRef[], selected: string[], typed: string, limit = 8): TagRef[] {
	const q = fold(typed);
	if (!q) return [];
	const taken = new Set(selected.map(fold));
	return known.filter((t) => !taken.has(fold(t.name)) && fold(t.name).includes(q)).slice(0, limit);
}
