export function fold(s: string): string {
	return s.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

// the FTS tokenizer folds diacritics but not ß, so index and query both map it to ss
export function foldSearch(s: string): string {
	return s.replace(/[ßẞ]/g, 'ss');
}
