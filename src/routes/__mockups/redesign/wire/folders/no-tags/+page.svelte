<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
		import { dataFor, resolveTree, wireTree } from '../../tree/data.ts';
	import FoldersBody from '../FoldersBody.svelte';

	const data = $derived(dataFor(page.url));
	const tree = $derived(wireTree(data));
</script>

<svelte:head><title>Folders, no tags (wireframe)</title></svelte:head>

<Frame view={resolveTree(tree)} tags={[]} current="folders">
	<FoldersBody folders={tree} tags={[]} sort={data.sort} worst={data.worst} />
</Frame>
