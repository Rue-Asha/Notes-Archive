<script lang="ts">
	const PATHS = {
		arrow: 'M5 12h14M13 6l6 6-6 6',
		back: 'M19 12H5M11 6l-6 6 6 6',
		plus: 'M12 5v14M5 12h14',
		search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
		more: 'M5 12h.01M12 12h.01M19 12h.01',
		chevron: 'M9 6l6 6-6 6',
		down: 'M6 9l6 6 6-6',
		close: 'M6 6l12 12M18 6L6 18',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		alert: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7.5v5M12 16.5h.01',
		grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
		note: 'M7 3h7l5 5v13H7zM14 3v5h5',
		folder: 'M3 6h6l2 2h10v11H3z',
		image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9h.01',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		colour: 'M6 16l6-12 6 12M8.5 11h7M4 20h16',
		bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z',
		italic: 'M10 5h8M6 19h8M14 5l-4 14',
		strike: 'M5 12h14M16 7.5C15.4 6 13.9 5 12 5c-2.5 0-4 1.3-4 3 0 1.3.8 2.3 2.4 3M14.5 14.5c.9.7 1.5 1.5 1.5 2.5 0 1.9-1.8 3-4.5 3-2.1 0-3.8-1-4.5-2.5',
		code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12',
		trash: 'M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13',
		up: 'M6 15l6-6 6 6',
		minus: 'M5 12h14',
		grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
		clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3 2',
		text: 'M5 7V5h14v2M12 5v14M9 19h6',
		list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
		download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
		out: 'M7 17L17 7M9 7h8v8'
	};
	type Name = keyof typeof PATHS;
	let { name, size = 18 }: { name: Name; size?: number } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={PATHS[name]} /></svg>
