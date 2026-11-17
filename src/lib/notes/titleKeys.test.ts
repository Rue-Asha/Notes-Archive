import { describe, expect, it } from 'vitest';
import { lf, onLastLine, titleKey, type TitleKey } from './titleKeys.ts';

const press = (key: string, mods: Partial<TitleKey> = {}): TitleKey => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, isComposing: false, ...mods });

describe('titleKeys', () => {
	it('Scenario: Enter in the title adds a line break', () => {
		expect(titleKey(press('Enter'), 'Japan', 5, 5)).toBeNull();
	});

	it('Scenario: Cmd or Ctrl+Enter moves to the body', () => {
		expect(titleKey(press('Enter', { ctrlKey: true }), 'Ja', 1, 1)).toBe('body');
		expect(titleKey(press('Enter', { metaKey: true }), 'Japan\n2026', 2, 2)).toBe('body');
		expect(titleKey(press('Enter', { ctrlKey: true, isComposing: true }), 'Ja', 1, 1)).toBeNull();
	});

	it('Scenario: ArrowDown on the last title line moves to the body', () => {
		expect(onLastLine('Japan\n2026', 3, 3)).toBe(false);
		expect(onLastLine('Japan\n2026', 7, 7)).toBe(true);
		expect(onLastLine('Japan\n2026', 3, 8)).toBe(false);
		expect(titleKey(press('ArrowDown'), 'Japan\n2026', 3, 3)).toBeNull();
		expect(titleKey(press('ArrowDown'), 'Japan\n2026', 10, 10)).toBe('last');
		expect(titleKey(press('ArrowDown', { shiftKey: true }), 'Japan', 5, 5)).toBeNull();
	});

	it('Scenario: Pasted CRLF text keeps its line breaks', () => {
		expect(lf('Eins\r\nZwei\rDrei\nVier')).toBe('Eins\nZwei\nDrei\nVier');
	});
});
