<script lang="ts">
	import type { PageProps } from './$types';
	import NotePage from './NotePage.svelte';

	let { data }: PageProps = $props();
</script>

<!-- Kit reuses the page component from note to note: the saver, the deleted notice and the title focus belong to one note -->
{#key data.note.id}
	<NotePage {data} />
{/key}
