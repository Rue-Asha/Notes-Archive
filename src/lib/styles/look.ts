import type { AccentName, CardName, GlassName } from './tokens.ts';

export interface Look {
	accent: AccentName;
	glass: GlassName;
	card: CardName;
}

export const LOOK: Look = { accent: 'bronze', glass: 'clear', card: 'glass' };

export function lookAttrs(override: Partial<Look> = {}): string {
	const { accent, glass, card } = { ...LOOK, ...override };
	return `data-accent="${accent}" data-glass="${glass}" data-card="${card}"`;
}
