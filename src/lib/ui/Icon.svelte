<script lang="ts" module>
	const paths = {
		home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
		search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.3 15.3 20 20',
		plus: 'M12 5v14M5 12h14',
		folder: 'M4 7a2 2 0 0 1 2-2h3.5l2 2.5H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
		'folder-open':
			'M4 18V7a2 2 0 0 1 2-2h3.5l2 2.5H17a2 2 0 0 1 2 2V10M4 18l2.4-7.2a1.5 1.5 0 0 1 1.4-1h12.4a1 1 0 0 1 1 1.3L18.8 17a2 2 0 0 1-1.9 1z',
		chevron: 'm9.5 6 6 6-6 6',
		tag: 'M3.5 12.5V5A1.5 1.5 0 0 1 5 3.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0zM8 8h.01',
		pin: 'M9 4h6l-1 5 3 3v1.5H7V12l3-3zM12 13.5V20',
		more: 'M6 12h.01M12 12h.01M18 12h.01',
		trash: 'M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7M10 11v5M14 11v5',
		move: 'M12 4v16M12 4 8.5 7.5M12 4l3.5 3.5M12 20l-3.5-3.5M12 20l3.5-3.5M4 12h16M4 12l3.5-3.5M4 12l3.5 3.5M20 12l-3.5-3.5M20 12l-3.5 3.5',
		grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
		image: 'M5 5h14v14H5zM5 15.5l4-4 3.5 3.5 2.5-2.5L19 16.5M15 9.5h.01',
		file: 'M7 4h7l4 4v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4v4h4M9 13h6M9 16.5h6',
		link: 'M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.8.8M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.8-.8',
		bold: 'M7 4.5h5.5a3.5 3.5 0 0 1 0 7H7zM7 11.5h6.5a3.5 3.5 0 0 1 0 7H7z',
		italic: 'M10 4.5h7M7 19.5h7M14 4.5l-4 15',
		strike: 'M5 12h14M16.5 7.5A4.5 3 0 0 0 12 5c-2.5 0-4.5 1.2-4.5 3.2 0 4 9 2.3 9 6.8 0 2-2 3.5-4.5 3.5a5 3.2 0 0 1-4.8-2.5',
		code: 'm8.5 8-4 4 4 4M15.5 8l4 4-4 4',
		palette:
			'M12 4a8 8 0 1 0 0 16c1.2 0 1.8-.8 1.8-1.6 0-1.4-1.3-1.5-1.3-2.8 0-.9.8-1.6 1.8-1.6H16a4 4 0 0 0 4-4C20 6.7 16.5 4 12 4zM7.5 11h.01M10 7.8h.01M14.5 7.8h.01',
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		close: 'M6 6l12 12M18 6 6 18',
		check: 'm5 12.5 4.5 4.5L19 7.5',
		sidebar: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5zM9.5 5v14',
		smile: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.8 14a4 4 0 0 0 6.4 0M9 9.8h.01M15 9.8h.01'
	} as const;

	export type IconName = keyof typeof paths;

	// drawn as zero-length strokes, so they need a thicker pen to read as dots
	const dots: readonly IconName[] = ['more', 'grip'];
</script>

<script lang="ts">
	let { name, size = 20, stroke = 1.5, label }: { name: IconName; size?: number; stroke?: number; label?: string } = $props();
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={dots.includes(name) ? 2.6 : stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={paths[name]} />
</svg>

<style>
	.icon {
		flex: none;
	}
</style>
