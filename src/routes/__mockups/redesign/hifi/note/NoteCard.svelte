<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from './Icon.svelte';
	import MenuIcon, { type IconName } from '../search/Icon.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import Properties from './Properties.svelte';
	import SaveStatus from './SaveStatus.svelte';
	import Toast from '../ui/Toast.svelte';
	import type { NoteView, Status } from './data.ts';

	type Props = { view: NoteView; status?: Status; expanded?: boolean; focusTitle?: boolean; body?: Snippet; typing?: { text: string; list: string[]; total: number; active: number } };
	let { view, status = 'saved', expanded, focusTitle = false, body, typing }: Props = $props();

	const phone = new MediaQuery('max-width: 767px');
	const gone = $derived(status === 'deleted');
	// a phone keeps only the note's own folder beside "…", so the path stays on one line
	const keep = $derived(phone.current ? 1 : 2);
	const long = $derived(view.path.length > keep + 1);
	let all = $state(false);
	let menuOpen = $state(false);
	type Item = MenuItem & { icon?: IconName };
	const items = $derived<Item[]>([
		{ label: 'Search', kbd: 'Ctrl K', icon: 'search' },
		{ label: view.pinned ? 'Unpin' : 'Pin', icon: 'pin' },
		{ label: 'Move to…', icon: 'folder' },
		{ label: 'Delete', danger: true, separator: true, icon: 'trash' }
	]);
	let anchor: HTMLElement | undefined = $state();
	$effect(() => {
		if (menuOpen) anchor?.querySelector<HTMLElement>('.item')?.focus();
	});
	function close(focus = false) {
		menuOpen = false;
		if (focus) anchor?.querySelector<HTMLElement>('button[aria-haspopup]')?.focus();
	}
	const held = $derived(long && !all ? view.path.slice(0, -keep) : []);
	const shown = $derived(held.length ? view.path.slice(-keep) : view.path);
	const cut = $derived(view.title.trimEnd().search(/\S+$/));
	const lead = $derived(cut > 0 ? view.title.slice(0, cut) : '');
	const tail = $derived(cut > 0 ? view.title.slice(cut) : view.title);
	const longTitle = $derived(view.title.length > 60 || view.title.split('\n').length > 3);
</script>

<svelte:window onclick={(e) => menuOpen && !anchor?.contains(e.target as Node) && (menuOpen = false)} />

<div class="note-wrap">
	<div class="bar">
		<nav class="path" aria-label="Note path">
			<ol class="kicker">
				<li><a href="/__mockups/redesign/hifi/home">Home</a></li>
				{#if held.length}
					<li><button type="button" class="kicker-more hit" aria-label={`Show ${held.length} more folders in the path`} title={held.join(' / ')} data-press onclick={() => (all = true)}>…</button></li>
				{/if}
				{#each shown as name, i (i)}
					<li>{#if i < shown.length - 1 || gone}<a href="/__mockups/redesign/hifi/folder" title={name}>{name}</a>{:else}<span aria-current="page" title={name}>{name}</span>{/if}</li>
				{/each}
			</ol>
		</nav>
		<div class="detail-actions">
			<SaveStatus {status} />
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="menu-anchor" bind:this={anchor} onkeydown={(e) => e.key === 'Escape' && close(true)}>
				<Button variant="quiet" icon aria-label="Note menu" aria-haspopup="menu" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}><Icon name="more" /></Button>
				{#if menuOpen}
					<div class="menu-pop">
						<Menu name="Note menu" {items} onselect={() => close(true)}>
							{#snippet icon(item)}{#if (item as Item).icon}<MenuIcon name={(item as Item).icon!} size={16} />{/if}{/snippet}
						</Menu>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<header class="head" class:gone inert={gone}>
		<h1 class="note-title" class:long={longTitle} class:focus={focusTitle} class:empty={!view.title}>{#if !view.title}Untitled{:else if focusTitle}{view.title}{:else}{lead}<em class="accent-word">{tail}</em>{/if}</h1>
		<Properties {view} {expanded} {typing} />
	</header>

	<article class="card editor" aria-label="Note">
		{#if gone}
			<div class="deleted" role="alert"><Icon name="alert" /><p>This note was deleted</p></div>
		{/if}
		<div class="content" inert={gone}>
			{#if body}{@render body()}{:else}<p class="placeholder">Write, or type / for blocks</p>{/if}
		</div>
	</article>

	{#if status === 'error'}
		<div class="toast-slot"><Toast message="Couldn’t save — try again" kind="error" /></div>
	{/if}
</div>

<style>
	.note-wrap { display: grid; gap: var(--space-4); min-inline-size: 0; max-inline-size: calc(var(--measure) + var(--space-16) * 2); }
	.bar { position: relative; z-index: var(--z-menu); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-2) var(--space-4); padding-block-start: var(--space-1); min-inline-size: 0; }
	.menu-anchor { position: relative; }
	.menu-pop { position: absolute; z-index: var(--z-menu); inset-inline-end: 0; inset-block-start: calc(100% + var(--space-1)); min-inline-size: 13rem; max-inline-size: calc(100vw - 2 * var(--space-4)); }
	.path { flex: 1 1 18rem; min-inline-size: 0; }
	.path [aria-current] { color: var(--ink); font-weight: var(--weight-bold); }
	.path a, .path span { overflow-wrap: anywhere; }
	/* touch keeps a 44px target: links grow their box; the "…" chip keeps its small pill and grows through .hit */
	@media (max-width: 1099px), (pointer: coarse) {
		.path a { display: inline-block; padding-block: calc((var(--target-touch) - 1lh) / 2); margin-block: calc((1lh - var(--target-touch)) / 2); }
	}

	/* the title sits on the field like every screen title; the white card holds the body */
	.head { display: grid; gap: var(--space-5); min-inline-size: 0; padding-block: var(--space-3) var(--space-2); }
	.head.gone { opacity: var(--disabled-opacity); }
	.note-title {
		min-inline-size: 0;
		max-inline-size: 18em;
		border-radius: var(--radius-text);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		text-wrap: pretty;
	}
	.note-title.long { max-inline-size: 26em; font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); letter-spacing: var(--type-display-l-tracking); }
	@media (max-width: 767px) {
		.note-title:not(.long) { font-size: var(--type-display-xl-size-compact); }
	}
	.note-title.empty { color: var(--ink-muted); }
	.note-title.focus { padding: var(--space-1) var(--space-3); margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-3)); border-radius: var(--radius-panel); outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.note-title.focus::before { content: ""; display: inline-block; inline-size: var(--stroke-rule); block-size: 0.9em; margin-inline-end: var(--space-0-5); vertical-align: text-bottom; background: var(--accent); }

	.editor { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-5); align-content: start; padding: var(--space-8) var(--space-9) var(--space-10); background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; box-shadow: var(--shadow-lift); }
	@media (max-width: 1099px) {
		.editor { padding: var(--space-6) var(--space-7) var(--space-8); }
	}
	@media (max-width: 767px) {
		.editor { gap: var(--space-4); padding: var(--space-5) var(--space-4) var(--space-6); border-radius: var(--radius-card-s); }
	}
	.deleted { display: flex; align-items: center; gap: var(--space-2-5); padding: var(--space-3) var(--space-4); border-radius: var(--radius-panel); background: var(--danger-soft); box-shadow: var(--ring-danger); color: var(--danger); font-weight: var(--weight-semibold); }
	.content { min-inline-size: 0; max-inline-size: var(--measure); }
	.content[inert] { opacity: var(--disabled-opacity); }
	.placeholder { font-size: var(--type-body-size); line-height: var(--type-body-line); color: var(--ink-muted); }
	.toast-slot { justify-self: start; max-inline-size: 100%; }
</style>
