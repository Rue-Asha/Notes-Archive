<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
		import { dataFor, resolveTree } from '../../tree/data.ts';
	import FoldersBody from '../FoldersBody.svelte';

	const data = $derived(dataFor(page.url));
</script>

<svelte:head><title>Folders, nothing yet (wireframe)</title></svelte:head>

<Frame view={resolveTree([], { empty: true })} tags={[]} current="folders">
	<FoldersBody folders={[]} tags={[]} sort={data.sort} worst={data.worst} />
</Frame>
