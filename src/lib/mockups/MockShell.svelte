<script lang="ts">
	import type { Snippet } from 'svelte';
	import MockBottomBar from './MockBottomBar.svelte';
	import MockSidebar from './MockSidebar.svelte';

	let { children, active = 'home' }: { children: Snippet; active?: 'home' | 'search' | 'tree' } = $props();
</script>

<div class="shell">
	<MockSidebar {active} />
	<main class="area">
		{@render children()}
	</main>
	<MockBottomBar active={active === 'tree' ? 'folders' : active} />
</div>

<style>
	.area {
		max-inline-size: 1400px;
		padding: var(--s-6) var(--gutter) calc(var(--s-11) + var(--s-6) + env(safe-area-inset-bottom));
	}

	@media (min-width: 1024px) {
		.area {
			padding-inline-start: calc(var(--sidebar-w) + var(--s-4) + var(--gutter));
			padding-block: var(--s-7) var(--s-10);
		}
	}
</style>
