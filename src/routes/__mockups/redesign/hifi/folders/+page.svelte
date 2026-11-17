<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import State from '../note/State.svelte';
	import SortMenu from '../tree/SortMenu.svelte';
	import Toast from '../ui/Toast.svelte';
	import { dataFor, wireTree } from '../tree/data.ts';
	import FoldersBody from './FoldersBody.svelte';

	const data = $derived(dataFor(page.url));
	let failed = $state(true);
</script>

<svelte:head><title>Folders (hi-fi)</title></svelte:head>

<Frame>
	<FoldersBody folders={wireTree(data)} tags={data.tags} sort={data.sort} worst={data.worst} />
	<div class="screen-body states">
		<State label="Sort save fails" note="Pick another mode: it shows for a beat, then the saved mode returns and a toast says why.">
			<div class="fail">
				<SortMenu mode={data.sort} align="start" glass fails onfail={() => (failed = true)} />
				{#if failed}<div role="alert"><Toast kind="error" message="Couldn’t save — try again" action="Retry" /></div>{/if}
			</div>
		</State>
	</div>
</Frame>

<style>
	.states {
		max-inline-size: 44rem;
		padding-block-start: var(--space-8);
	}
	.fail {
		display: grid;
		justify-items: start;
		gap: var(--space-3);
		min-inline-size: 0;
	}
</style>
