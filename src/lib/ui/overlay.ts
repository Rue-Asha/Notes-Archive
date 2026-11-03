// A fixed overlay inside a glass or transformed ancestor is positioned against that ancestor, so overlays live on <body>.
export function portal(node: HTMLElement): { destroy(): void } {
	document.body.append(node);
	return { destroy: () => node.remove() };
}

const focusable = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function trapTab(event: KeyboardEvent, root: HTMLElement): void {
	if (event.key !== 'Tab') return;
	const items = [...root.querySelectorAll<HTMLElement>(focusable)];
	if (!items.length) {
		event.preventDefault();
		return;
	}
	const at = items.indexOf(document.activeElement as HTMLElement);
	event.preventDefault();
	items[(at + (event.shiftKey ? -1 : 1) + items.length) % items.length].focus();
}
