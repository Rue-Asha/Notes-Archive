<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
		import { dataFor, wireTree } from '../tree/data.ts';
	import FoldersBody from './FoldersBody.svelte';

	const data = $derived(dataFor(page.url));
</script>

<svelte:head><title>Folders (wireframe)</title></svelte:head>

<Frame>
	<FoldersBody folders={wireTree(data)} tags={data.tags} sort={data.sort} worst={data.worst} />
</Frame>
