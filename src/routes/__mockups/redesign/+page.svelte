<script lang="ts">
	import { page } from '$app/state';
	import Frame from './Frame.svelte';

	const base = '/__mockups/redesign';
	const screens = Object.keys(import.meta.glob('./**/+page.svelte'))
		.map((key) => key.replace(/^\.\/(.*)\/\+page\.svelte$/, '$1'))
		.filter((slug) => !slug.endsWith('+page.svelte'))
		.sort();
	const query = $derived(page.url.searchParams.get('data') === 'worst' ? '?data=worst' : '');
</script>

<svelte:head><title>Redesign mockups</title></svelte:head>

<Frame>
	<section class="card">
		<div class="card-head">
			<h2>Redesign mockups</h2>
			<p class="card-note">
				{screens.length === 1 ? '1 screen' : `${screens.length} screens`} ·
				{#if query}<a href={base}>Normal data</a>{:else}<a href="{base}?data=worst">Worst-case data</a>{/if}
			</p>
		</div>
		{#if screens.length}
			<ul>
				{#each screens as slug (slug)}
					<li><a href="{base}/{slug}{query}">{slug}</a></li>
				{/each}
			</ul>
		{:else}
			<p>No screens yet.</p>
		{/if}
	</section>
</Frame>
