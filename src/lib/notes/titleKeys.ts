// the server stores a title with LF line breaks only (notes.ts), so the field sends the same shape
export const lf = (text: string): string => text.replace(/\r\n?/g, '\n');

export type TitleKey = { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean; shiftKey: boolean; isComposing: boolean };

export const onLastLine = (value: string, start: number, end: number): boolean => start === end && !value.slice(start).includes('\n');

// 'body': leave for the body now; 'last': leave from the last visual row, or when the key did not move the caret (a wrapped last line still has rows to walk)
export function titleKey(event: TitleKey, value: string, start: number, end: number): 'body' | 'last' | null {
	if (event.isComposing || event.altKey) return null;
	if (event.key === 'Enter') return event.ctrlKey || event.metaKey ? 'body' : null;
	if (event.key === 'ArrowDown' && !event.ctrlKey && !event.metaKey && !event.shiftKey && onLastLine(value, start, end)) return 'last';
	return null;
}
