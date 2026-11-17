<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import Properties from './Properties.svelte';
	import SaveStatus from './SaveStatus.svelte';
	import type { NoteView, Status } from './data.ts';

	type Props = { view: NoteView; status?: Status; expanded?: boolean; focusTitle?: boolean; body?: Snippet };
	let { view, status = 'saved', expanded, focusTitle = false, body }: Props = $props();

	const gone = $derived(status === 'deleted');
	// a deep path keeps Home, the last two folders and a button for the held-back middle
	const long = $derived(view.path.length > 3);
	const tail = $derived(long ? view.path.slice(-2) : view.path);
	const held = $derived(long ? view.path.slice(0, -2) : []);
</script>

<article class="w-card note" class:gone>
	<div class="bar">
		<nav aria-label="Path">
			<ol class="path">
				<li><a href="/__mockups/redesign/wire/home">Home</a></li>
				{#if held.length}
					<li><button type="button" class="more" aria-label={`Show ${held.length} more folders: ${held.join(' / ')}`} title={held.join(' / ')}>…</button></li>
				{/if}
				{#each tail as name, i (i)}
					<li>{#if i < tail.length - 1}<a href="/__mockups/redesign/wire/folder" title={name}>{name}</a>{:else}<span aria-current="page" title={name}>{name}</span>{/if}</li>
				{/each}
			</ol>
		</nav>
		<div class="end">
			<SaveStatus {status} />
			<button type="button" class="w-icon" aria-label="Note menu" aria-haspopup="menu"><Icon name="dots" /></button>
		</div>
	</div>

	<h1 class="title" class:empty={!view.title} class:focus={focusTitle} aria-label="Title">{view.title || 'Untitled'}</h1>

	<Properties {view} {expanded} />

	<div class="content">
		{#if body}{@render body()}{:else}<p class="placeholder">Write, or type / for blocks</p>{/if}
	</div>
</article>

<style>
	.note { display: grid; gap: var(--space-4); padding: var(--space-6); max-inline-size: calc(var(--measure) + var(--space-16) * 2); }
	@media (max-width: 640px) { .note { padding: var(--space-4); gap: var(--space-3); } }
	.bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1) var(--space-3); min-inline-size: 0; }
	nav { min-inline-size: 0; flex: 1 1 14rem; }
	.path { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-0-5) var(--space-1-5); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.path li { display: flex; align-items: center; gap: var(--space-1-5); min-inline-size: 0; }
	.path li + li::before { content: "/"; color: var(--ink-muted); }
	.path a, .path span { overflow-wrap: anywhere; }
	.path [aria-current] { color: var(--ink); font-weight: var(--weight-medium); }
	.more { min-inline-size: var(--target); min-block-size: var(--control-height-xs); border: 0; border-radius: var(--radius-pill); background: var(--surface-tint); }
	.end { display: flex; align-items: center; gap: var(--space-1); margin-inline-start: auto; }
	.title { font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); letter-spacing: var(--type-display-l-tracking); white-space: pre-wrap; overflow-wrap: anywhere; text-wrap: pretty; max-inline-size: 100%; border-radius: var(--radius-text); }
	@media (max-width: 640px) { .title { font-size: var(--type-display-m-size); } }
	.title.empty { color: var(--ink-muted); }
	.title.focus { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.title.empty.focus::before { content: ""; display: inline-block; inline-size: var(--stroke-rule); block-size: 1em; margin-inline-end: var(--space-0-5); vertical-align: text-bottom; background: var(--ink); }
	.content { padding-block-start: var(--space-3); box-shadow: var(--rule-above); min-inline-size: 0; }
	.placeholder { font-size: var(--type-body-size); line-height: var(--type-body-line); color: var(--ink-muted); }
	.gone .title, .gone .content { opacity: var(--disabled-opacity); }
</style>
