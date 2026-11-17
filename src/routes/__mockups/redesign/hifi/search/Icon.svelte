<script module lang="ts">
	export type IconName = 'search' | 'plus' | 'folder' | 'folderPlus' | 'chevronDown' | 'more' | 'note' | 'check' | 'tag' | 'close' | 'arrow' | 'trash' | 'alert' | 'clock' | 'image' | 'pin' | 'arrowUp' | 'arrowDown' | 'cover';

	const shapes: Record<IconName, string> = {
		search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
		folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10.5v5M9.5 13h5"/>',
		chevronDown: '<path d="M6 9l6 6 6-6"/>',
		more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
		note: '<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/>',
		check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
		close: '<path d="M6 6l12 12M18 6L6 18"/>',
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3"/>',
		alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
		pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
		arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
		arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
		cover: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15h18"/>'
	};
</script>

<script lang="ts">
	let { name, size = 18 }: { name: IconName; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{@html shapes[name]}
</svg>
