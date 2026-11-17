<script module lang="ts">
	export type IconName = 'home' | 'search' | 'plus' | 'folder' | 'folderPlus' | 'chevronRight' | 'chevronDown' | 'chevronLeft' | 'sort' | 'sidebar' | 'more' | 'note' | 'check' | 'tag' | 'image' | 'arrow' | 'clock';

	const shapes: Record<IconName, string> = {
		home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
		search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
		folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 10.5v5M9.5 13h5"/>',
		chevronRight: '<path d="M9 6l6 6-6 6"/>',
		chevronDown: '<path d="M6 9l6 6 6-6"/>',
		chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
		sort: '<path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/>',
		sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
		more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
		note: '<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/>',
		check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
		image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
		arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
	};
</script>

<script lang="ts">
	let { name, size = 18 }: { name: IconName; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{@html shapes[name]}
</svg>
