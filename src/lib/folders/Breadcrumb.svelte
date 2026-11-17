<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { COPY } from '#lib/copy.ts';
	import type { Crumb } from '#lib/types.ts';

	let { crumbs }: { crumbs: Crumb[] } = $props();

	// wide: from ten levels the first and the last two ancestors stay; compact: from two levels one control stands for them
	// and the back button names the parent
	const narrow = new MediaQuery('max-width: 1099px');
	let more = $state(false);

	const path = $derived(crumbs.slice(0, -1));
	const current = $derived(crumbs.at(-1));
	const shortened = $derived(!more && (narrow.current ? path.length >= 2 : path.length >= 10));
	const head = $derived(shortened ? (narrow.current ? [] : path.slice(0, 1)) : path);
	const tail = $derived(shortened && !narrow.current ? path.slice(-2) : []);

	// another folder opens shortened again
	$effect(() => {
		void current?.id;
		more = false;
	});

	let list = $state<HTMLOListElement>();

	// the control that was pressed goes away, so the focus moves to the first folder it showed, or back to "…"
	async function show(open: boolean) {
		const shown = 1 + head.length;
		more = open;
		await tick();
		if (open) list?.querySelectorAll<HTMLElement>('a')[shown]?.focus();
		else list?.querySelector<HTMLElement>('.kicker-more')?.focus();
	}
</script>

<nav aria-label="Breadcrumb">
	<ol class="kicker" lang="de" bind:this={list}>
		<li><a href="/folders">{COPY.folders}</a></li>
		{#each head as crumb (crumb.id)}
			<li><a href="/folders/{crumb.id}" title={crumb.name}>{crumb.name}</a></li>
		{/each}
		{#if shortened}
			<li><button type="button" class="kicker-more hit" aria-label={COPY.pathMore(path.length)} aria-expanded="false" onclick={() => show(true)}>…</button></li>
		{/if}
		{#each tail as crumb (crumb.id)}
			<li><a href="/folders/{crumb.id}" title={crumb.name}>{crumb.name}</a></li>
		{/each}
		{#if more && (narrow.current ? path.length >= 2 : path.length >= 10)}
			<li><button type="button" class="kicker-more fold hit" aria-expanded="true" onclick={() => show(false)}>Shorten path</button></li>
		{/if}
		<li aria-current="page">{current?.name}</li>
	</ol>
</nav>

<style>
	nav {
		min-inline-size: 0;
	}

	/* the fingerprint's kicker link is inline-flex, which shows no ellipsis: an inline box keeps the cut visible */
	.kicker a {
		display: inline-block;
		line-height: var(--target-min);
		max-inline-size: 20ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.kicker li {
		min-inline-size: 0;
		max-inline-size: 100%;
	}

	.kicker li[aria-current] {
		overflow-wrap: anywhere;
	}

	.fold {
		background: none;
		font-weight: var(--weight-medium);
		letter-spacing: 0;
		text-decoration: underline;
	}

	/* touch keeps a 44 px target: the links grow their box, not their line */
	@media (max-width: 1099px), (pointer: coarse) {
		.kicker a,
		.fold {
			display: inline-block;
			padding-block: calc((var(--target-touch) - 1lh) / 2);
			margin-block: calc((1lh - var(--target-touch)) / 2);
		}
	}
</style>
