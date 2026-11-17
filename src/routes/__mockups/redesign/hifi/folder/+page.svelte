<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { dataFor } from '../tree/data.ts';
	import FolderBody from './FolderBody.svelte';

	const data = $derived(dataFor(page.url));
</script>

<svelte:head><title>Folder page (hi-fi)</title></svelte:head>

<Frame>
	<FolderBody folder={{ ...data.folder, cover: true }} worst={data.worst} />
</Frame>
