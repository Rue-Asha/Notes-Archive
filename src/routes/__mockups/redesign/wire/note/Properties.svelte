<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import Icon from './Icon.svelte';
	import { createdOn, editedAt, tagCount } from './format.ts';
	import type { NoteView } from './data.ts';

	type Props = { view: NoteView; expanded?: boolean };
	let { view, expanded }: Props = $props();

	const phone = new MediaQuery('max-width: 640px');
	let chosen = $state<boolean | null>(null);
	const open = $derived(chosen ?? expanded ?? !phone.current);

	const folder = $derived(view.path.length ? view.path.join(' / ') : 'Root');
	const summary = $derived(`${folder} · ${tagCount(view.tags.length)}`);
</script>

<section class="props" aria-label="Note properties">
	<button type="button" class="head" aria-expanded={open} onclick={() => (chosen = !open)} title={open ? undefined : summary}>
		<span class="head-text" class:summary={!open}>{open ? 'Properties' : summary}</span>
		<span class="turn" class:open><Icon name="chevron" /></span>
	</button>
	{#if open}
		<div class="rows" role="group" aria-label="Properties">
			<div class="row">
				<span class="k">Icon</span>
				<div class="v"><button type="button" class="w-btn quiet pick">{#if view.icon}<span class="emoji">{view.icon}</span>Change icon{:else}Add icon{/if}</button></div>
			</div>
			<div class="row">
				<span class="k">Folder</span>
				<div class="v"><button type="button" class="w-btn pick folder" aria-label={`Folder: ${view.path.at(-1) ?? 'Root'}`} title={folder}><Icon name="folder" /><span class="path">{folder}</span></button></div>
			</div>
			<div class="row">
				<span class="k">Tags</span>
				<div class="v tags">
					{#each view.tags as tag (tag)}
						<span class="w-chip">{tag}<button type="button" aria-label={`Remove ${tag}`}><Icon name="close" /></button></span>
					{/each}
					<label class="add"><span class="sr-only">Add a tag</span><input type="text" placeholder="Add a tag" /></label>
				</div>
			</div>
			<div class="row">
				<span class="k">Pinned</span>
				<div class="v"><button type="button" class="switch" role="switch" aria-checked={view.pinned} aria-label="Pinned"><span class="knob"></span></button></div>
			</div>
			<div class="row">
				<span class="k">Dates</span>
				<p class="v dates">Edited {editedAt(view.updated)} · Created {createdOn(view.created)}</p>
			</div>
		</div>
	{/if}
</section>

<style>
	.props { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); inline-size: 100%; min-block-size: var(--control-height-s); padding: var(--space-1) var(--space-3); border: 0; border-radius: var(--radius-item); background: var(--surface-tint); text-align: start; color: var(--ink-secondary); font-size: var(--type-caption-size); line-height: var(--type-caption-line); min-inline-size: 0; }
	.head-text { min-inline-size: 0; overflow-wrap: anywhere; }
	.head-text.summary { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.turn { display: grid; place-items: center; }
	.turn.open :global(svg) { rotate: 180deg; }
	.rows { display: grid; padding-block-start: var(--space-1); }
	.row { display: grid; grid-template-columns: 5.5rem minmax(0, 1fr); gap: var(--space-3); align-items: start; padding-block: var(--space-1); box-shadow: var(--rule-above); }
	.row:first-child { box-shadow: none; }
	.k { padding-block: var(--space-2-5); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); }
	.v { min-inline-size: 0; padding-block: var(--space-1); }
	.pick { justify-content: flex-start; max-inline-size: 100%; text-align: start; }
	.folder { block-size: auto; padding-block: var(--space-2); text-align: start; }
	.path { overflow-wrap: anywhere; min-inline-size: 0; text-align: start; }
	.emoji { font-size: var(--type-title-size); }
	.tags { display: flex; flex-wrap: wrap; gap: var(--space-1-5); align-items: center; }
	.add input { min-block-size: var(--control-height-xs); inline-size: 9rem; max-inline-size: 100%; padding-inline: var(--space-3); border: 0; border-radius: var(--radius-pill); background: transparent; box-shadow: var(--ring-control); font-size: var(--type-caption-size); }
	.switch { position: relative; inline-size: var(--space-10); block-size: var(--space-6); padding: 0; border: 0; border-radius: var(--radius-pill); background: var(--surface-tint-strong); }
	.switch .knob { position: absolute; inset-block: var(--space-0-5); inset-inline-start: var(--space-0-5); inline-size: var(--space-5); border-radius: var(--radius-round); background: var(--surface-raised); box-shadow: var(--ring-control); }
	.switch[aria-checked="true"] { background: var(--ink); }
	.switch[aria-checked="true"] .knob { inset-inline-start: calc(100% - var(--space-5) - var(--space-0-5)); box-shadow: none; }
	.dates { padding-block: var(--space-2-5); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); }
	@media (max-width: 420px) { .row { grid-template-columns: minmax(0, 1fr); gap: 0; } .k { padding-block-end: 0; } }
</style>
