export const palette = $state({ open: false });

export function openPalette(): void {
	palette.open = true;
}

export function closePalette(): void {
	palette.open = false;
}
