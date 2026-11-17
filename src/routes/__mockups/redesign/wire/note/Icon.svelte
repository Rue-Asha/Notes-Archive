<script lang="ts">
	let { name }: { name: 'chevron' | 'dots' | 'search' | 'plus' | 'grip' | 'check' | 'close' | 'folder' | 'pin' | 'back' | 'link' | 'file' | 'image' | 'caret' } = $props();
</script>

<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#if name === 'chevron'}<path d="m6 9 6 6 6-6" />
	{:else if name === 'caret'}<path d="m9 6 6 6-6 6" />
	{:else if name === 'back'}<path d="m15 6-6 6 6 6" />
	{:else if name === 'dots'}<circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
	{:else if name === 'search'}<circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" />
	{:else if name === 'plus'}<path d="M12 5v14M5 12h14" />
	{:else if name === 'grip'}<circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" />
	{:else if name === 'check'}<path d="m5 12.5 4.5 4.5L19 7.5" />
	{:else if name === 'close'}<path d="M6 6l12 12M18 6 6 18" />
	{:else if name === 'folder'}<path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2.2h8a1.5 1.5 0 0 1 1.5 1.5v7.8a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5Z" />
	{:else if name === 'pin'}<path d="M9 4h6l-1 6 3 3H7l3-3ZM12 13v7" />
	{:else if name === 'link'}<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
	{:else if name === 'file'}<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM14 3.5V8h4" />
	{:else if name === 'image'}<rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m4 17 5-4 4 3 3-2 4 3" />{/if}
</svg>
