<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: cls = '' }: { children: Snippet; class?: string } = $props();
</script>

<p class="eyebrow {cls}">{@render children()}</p>
