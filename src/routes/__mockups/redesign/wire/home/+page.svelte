<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Specimen from '../note/Specimen.svelte';
	import '../note/wire.css';
	import Desk from './Desk.svelte';
	import { withWorstTags } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const pinned = $derived(withWorstTags(data.pinned, data.worst));
	const recent = $derived(withWorstTags(data.recent, data.worst).slice(0, 8));
</script>

<svelte:head><title>Home · wireframe</title></svelte:head>

<Frame>
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Home</p>
			<h1>Your desk</h1>
		</header>
		<Desk {pinned} {recent} />

		<div class="w-states">
			<h2>States</h2>
			<Specimen label="Welcome — no notes, no folders" note="Welcome replaces Pinned and Recently edited.">
				<Desk pinned={[]} recent={[]} empty />
			</Specimen>
			<Specimen label="Welcome — no notes, with folders" note="Same state: top-level folders are not on Home, so nothing else shows.">
				<Desk pinned={[]} recent={[]} empty />
			</Specimen>
			<Specimen label="No pinned notes" note="Pinned is absent; Recently edited takes the width.">
				<Desk pinned={[]} {recent} />
			</Specimen>
			<Specimen label="One pinned note" note="No drag handle, no Move up / Move down.">
				<Desk pinned={pinned.slice(0, 1)} recent={recent.slice(0, 3)} menu={{ list: 'pinned', id: pinned[0].id }} />
			</Specimen>
			<Specimen label="Pinned entry menu — second of three" note="Move up / Move down in the entry menu, disabled at the ends; the handle is for pointers only.">
				<Desk pinned={pinned.slice(0, 3)} recent={recent.slice(0, 2)} menu={{ list: 'pinned', id: pinned[1].id }} />
			</Specimen>
			<Specimen label="Pinned entry menu — first of three" note="Move up is disabled at the top.">
				<Desk pinned={pinned.slice(0, 3)} recent={recent.slice(0, 2)} menu={{ list: 'pinned', id: pinned[0].id }} />
			</Specimen>
		</div>
	</div>
</Frame>
