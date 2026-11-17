<script lang="ts">
	import { onMount } from 'svelte';
	import Desk from '#lib/home/Desk.svelte';
	import { longDay } from '#lib/notes/time.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// the date is the reader's, not the server's: the server's guess only holds the line's place (hidden) until the
	// browser names its own day, and the kicker turns over at local midnight and when the tab comes back
	let today = $state('');
	onMount(() => {
		let timer: ReturnType<typeof setTimeout>;
		const tick = () => {
			const now = new Date();
			today = longDay(now);
			clearTimeout(timer);
			timer = setTimeout(tick, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime());
		};
		tick();
		document.addEventListener('visibilitychange', tick);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('visibilitychange', tick);
		};
	});
</script>

<svelte:head><title>Notes Archive</title></svelte:head>

<div class="home">
	<header class="lead">
		<ul class="kicker"><li>Home</li><li data-today style:visibility={today ? null : 'hidden'}>{today || longDay()}</li></ul>
		<h1>Your <em class="accent-word">desk</em></h1>
		<p class="lede">Pinned notes in your order, then what you edited last.</p>
	</header>
	<Desk pinned={data.pinned} recent={data.recent} />
</div>

<style>
	.home {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.lead {
		display: grid;
		gap: var(--space-4);
		justify-items: start;
	}
</style>
