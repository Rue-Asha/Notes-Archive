import type { MockCard } from '../../fixtures.ts';

export interface SnippetPart {
	text: string;
	hit: boolean;
}

export function plural(n: number, one: string, many = `${one}s`) {
	return `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;
}

export function when(iso: string) {
	return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ago(i: number) {
	return ['12 min ago', '2 h ago', 'Yesterday', '2 days ago', '5 days ago', '1 week ago', '2 weeks ago', '3 weeks ago'][i] ?? 'Last month';
}

// ordered pieces like the server's snippet parts: the first query term marks the hit
export function parts(text: string, q: string): SnippetPart[] {
	const term = q.trim().split(/\s+/)[0]?.toLowerCase();
	if (!term) return [{ text, hit: false }];
	const at = text.toLowerCase().indexOf(term);
	if (at < 0) return [{ text, hit: false }];
	return [
		{ text: text.slice(0, at), hit: false },
		{ text: text.slice(at, at + term.length), hit: true },
		{ text: text.slice(at + term.length), hit: false }
	].filter((p) => p.text);
}

// the fixtures carry at most 8 cards; the search page shows up to 50, so the worst case repeats them
export function many(cards: MockCard[], n: number): MockCard[] {
	return Array.from({ length: n }, (_, i) => ({ ...cards[i % cards.length], id: i + 1 }));
}

// fixture snippets don't contain the query; make every hit show its highlight
export function withTerm(cards: MockCard[], q: string): MockCard[] {
	const term = q.trim().split(/\s+/)[0];
	if (!term) return cards;
	return cards.map((c) => (c.snippet.toLowerCase().includes(term.toLowerCase()) ? c : { ...c, snippet: `…a few lines on ${term}, then ${c.snippet}` }));
}
