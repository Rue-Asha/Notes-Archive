<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { withTerm } from '../search/data.ts';
	import Palette from './Palette.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const query = $derived(data.worst ? data.search.query : 'berlin');
	const hits = $derived(withTerm(data.recent.slice(0, 8), query));
	const miss = $derived(data.worst ? data.search.query : 'zebra');
	const states = $derived<{ label: string; state: 'empty' | 'typing' | 'nohits'; q: string }[]>([
		{ label: 'State 1 · Empty: Recent + Actions', state: 'empty', q: '' },
		{ label: 'State 2 · Typing: up to 8 hits, Actions, See all results', state: 'typing', q: query },
		{ label: 'State 3 · No hits for an answered query', state: 'nohits', q: miss }
	]);
</script>

<svelte:head><title>Search · Notes Archive</title></svelte:head>

<Frame>
	<section class="card panel" aria-labelledby="h">
		<h1 id="h" class="type-display-m">Command palette</h1>
		<p class="card-note">Dialog named “Search”, over the open page. Centred panel on pointer, full screen on touch.</p>
	</section>

	{#each states as s (s.label)}
		<section class="card panel veiled" aria-label={s.label}>
			<p class="state type-overline">{s.label}</p>
			<div class="veil">
				<Palette state={s.state} query={s.q} recent={data.recent} {hits} />
			</div>
		</section>
	{/each}

	<section class="card panel veiled" aria-label="Phone full screen">
		<p class="state type-overline">State 4 · Touch posture: full screen, owns one history entry, Close at the end of the field</p>
		<div class="phones">
			<div class="device"><Palette state="empty" recent={data.recent} phone /></div>
			<div class="device"><Palette state="typing" query={query} recent={data.recent} {hits} phone /></div>
		</div>
	</section>
</Frame>

<style>
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.state { color: var(--ink-muted); }
	.veil {
		padding: var(--space-8) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-tint-strong);
	}
	.phones {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-5);
		justify-content: center;
	}
	.device {
		inline-size: min(100%, 375px);
		block-size: 40rem;
		border-radius: var(--radius-card-s);
		overflow: hidden;
		box-shadow: var(--ring-hairline);
	}
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
		.veil { padding: var(--space-3) var(--space-2); }
	}
</style>
