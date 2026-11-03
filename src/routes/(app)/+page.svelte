<script lang="ts">
	import Bento from '#lib/home/Bento.svelte';
	import Hero from '#lib/home/Hero.svelte';
	import Welcome from '#lib/home/Welcome.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const empty = $derived(!data.recent.length && !data.tiles.length);
</script>

<svelte:head><title>Notes Archive</title></svelte:head>

<div class="home">
	<Hero />
	{#if empty}
		<Welcome />
	{:else}
		<Bento pinned={data.pinned} recent={data.recent} tiles={data.tiles} />
	{/if}
</div>

<style>
	.home {
		display: grid;
		gap: var(--s-9);
	}
</style>
