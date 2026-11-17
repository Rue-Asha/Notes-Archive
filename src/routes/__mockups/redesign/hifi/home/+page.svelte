<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import State from '../note/State.svelte';
	import Desk from './Desk.svelte';
	import { PINNED_CONFLICT, SAVE_FAILED, withWorstTags } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const pinned = $derived(withWorstTags(data.pinned, data.worst));
	const recent = $derived(withWorstTags(data.recent, data.worst).slice(0, 8));
</script>

<svelte:head><title>Home · hi-fi</title></svelte:head>

<Frame current="home">
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Home</li><li>Saturday 14 November</li></ul>
			<h1>Your <em class="accent-word">desk</em></h1>
			<p class="lede">Pinned notes in your order, then what you edited last.</p>
		</div>
	</header>
	<div class="screen-body home">
		<Desk {pinned} {recent} />

		<div class="states">
			<h2>States</h2>
			<State label="Welcome — no notes, no folders" note="Welcome replaces Pinned and Recently edited.">
				<Desk pinned={[]} recent={[]} empty />
			</State>
			<State label="Welcome — no notes, with folders" note="Same state: top-level folders are not on Home, so nothing else shows.">
				<Desk pinned={[]} recent={[]} empty />
			</State>
			<State label="No pinned notes" note="Pinned is absent; Recently edited takes the width.">
				<Desk bar={false} pinned={[]} {recent} />
			</State>
			<State label="One pinned note" note="No drag handle, no Move up or Move down in the menu.">
				<div class="room"><Desk bar={false} pinned={pinned.slice(0, 1)} recent={recent.slice(0, 3)} menu={{ list: 'pinned', id: pinned[0].id }} /></div>
			</State>
			<State label="Pinned entry menu — second of three" note="Move up and Move down sit in the entry menu; the handle is for pointers only. Try them: the entry slides, focus returns to its menu button. Reduced motion removes the slide.">
				<div class="room"><Desk bar={false} pinned={pinned.slice(0, 3)} recent={recent.slice(0, 2)} menu={{ list: 'pinned', id: pinned[1].id }} /></div>
			</State>
			<State label="Pinned entry menu — first of three" note="Move up is disabled at the top; Move down at the bottom.">
				<div class="room"><Desk bar={false} pinned={pinned.slice(0, 3)} recent={recent.slice(0, 2)} menu={{ list: 'pinned', id: pinned[0].id }} /></div>
			</State>
			<State label="409 — reloaded" note="After a move: the list is back in the server's order and a polite toast says what happened. Open an entry menu to try it.">
				<div class="room"><Desk bar={false} pinned={pinned.slice(0, 3)} recent={[]} outcome="conflict" toast={{ message: PINNED_CONFLICT }} /></div>
			</State>
			<State label="Save fails — order reverts" note="After a move: one toast with the failure; the list is back in the saved order. Open an entry menu to try it.">
				<div class="room"><Desk bar={false} pinned={pinned.slice(0, 3)} recent={[]} outcome="failed" toast={{ message: SAVE_FAILED, kind: 'error' }} /></div>
			</State>
		</div>
	</div>
</Frame>

<style>
	.home { gap: var(--space-8); min-inline-size: 0; }
	.states { display: grid; gap: var(--space-8); padding-block-start: var(--space-8); box-shadow: var(--rule-above); }
	.room { padding-block-end: var(--space-16); }
</style>
