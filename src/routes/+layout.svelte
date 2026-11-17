<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Toast from '#lib/shell/Toast.svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		document.documentElement.dataset.hydrated = '';
	});
</script>

{@render children()}
<Toast />
