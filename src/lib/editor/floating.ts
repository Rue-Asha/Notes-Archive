const GAP = 6;
const MARGIN = 8;

interface Box {
	top: number;
	left: number;
	width: number;
	height: number;
}

// On phone the visual viewport is what's left above the soft keyboard (and under a pinch zoom); the layout viewport is not
export function visibleViewport(): Box {
	const v = window.visualViewport;
	return v
		? { top: v.offsetTop, left: v.offsetLeft, width: v.width, height: v.height }
		: { top: 0, left: 0, width: innerWidth, height: innerHeight };
}

// Below the anchor when it fits or has more room than above, otherwise above; it shrinks to the room on the chosen side.
export function fit(anchor: DOMRect, size: { width: number; height: number }, viewport: Box = visibleViewport()) {
	const room = {
		below: viewport.top + viewport.height - anchor.bottom - GAP - MARGIN,
		above: anchor.top - viewport.top - GAP - MARGIN
	};
	const below = size.height <= room.below || room.below >= room.above;
	const height = Math.max(0, Math.min(size.height, below ? room.below : room.above));
	const left = Math.max(viewport.left + MARGIN, Math.min(anchor.left, viewport.left + viewport.width - MARGIN - size.width));
	return { top: below ? anchor.bottom + GAP : anchor.top - GAP - height, left, maxHeight: height };
}

export function placeFloating(el: HTMLElement, anchor: DOMRect): void {
	el.style.maxBlockSize = '';
	const { top, left, maxHeight } = fit(anchor, { width: el.offsetWidth, height: el.scrollHeight });
	el.style.maxBlockSize = `${maxHeight}px`;
	el.style.insetBlockStart = `${top}px`;
	el.style.insetInlineStart = `${left}px`;
}

export function watchViewport(onchange: () => void): () => void {
	const v = window.visualViewport;
	addEventListener('scroll', onchange, true);
	addEventListener('resize', onchange);
	v?.addEventListener('resize', onchange);
	v?.addEventListener('scroll', onchange);
	return () => {
		removeEventListener('scroll', onchange, true);
		removeEventListener('resize', onchange);
		v?.removeEventListener('resize', onchange);
		v?.removeEventListener('scroll', onchange);
	};
}
