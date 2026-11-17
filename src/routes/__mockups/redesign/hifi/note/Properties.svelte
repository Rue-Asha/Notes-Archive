<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import Icon from './Icon.svelte';
	import { createdOn, editedAt, shortPath, tagCount } from './format.ts';
	import type { NoteView } from './data.ts';

	type Props = { view: NoteView; expanded?: boolean; typing?: { text: string; list: string[]; total: number; active: number } };
	let { view, expanded, typing }: Props = $props();

	const phone = new MediaQuery('max-width: 767px');
	let chosen = $state<boolean | null>(null);
	const open = $derived(chosen ?? expanded ?? !phone.current);
	// svelte-ignore state_referenced_locally
	let pinned = $state(view.pinned);

	const folder = $derived(view.path.length ? view.path.join(' / ') : 'Top level');
	const short = $derived(view.path.length ? shortPath(view.path) : 'Top level');
	const summary = $derived(`${short} · ${tagCount(view.tags.length)}`);
</script>

<section class="props" aria-label="Note properties">
	<div class="facts seg-bar" class:open>
		<button type="button" class="icon" class:none={!view.icon} aria-label={view.icon ? 'Change icon' : 'Add icon'} title={view.icon ? 'Change icon' : 'Add icon'} data-press="round">{#if view.icon}<span aria-hidden="true">{view.icon}</span>{:else}<Icon name="plus" size={18} />{/if}</button>
		{#if open}
			<div class="cells" id="props-rows" role="group" aria-label="Properties">
				<button type="button" class="seg pick" aria-label={`Folder: ${folder}`} title={folder} data-press>
					<Icon name="folder" size={18} />
					<span class="seg-text"><span class="seg-label">Folder</span><span class="seg-value path">{short}</span></span>
					<Icon name="down" size={14} />
				</button>
				<button type="button" class="seg pin" role="switch" aria-checked={pinned} aria-label="Pinned" data-press onclick={() => (pinned = !pinned)}>
					<span class="dot" aria-hidden="true">{#if pinned}<Icon name="check" size={14} />{/if}</span>
					<span class="seg-text" aria-hidden="true"><span class="seg-label">Pinned</span><span class="seg-value">{pinned ? 'On' : 'Off'}</span></span>
				</button>
				<div class="seg edited">
					<Icon name="clock" size={18} />
					<span class="seg-text"><span class="seg-label">Edited</span><span class="seg-value">{editedAt(view.updated)}</span></span>
				</div>
				<div class="seg created">
					<Icon name="note" size={18} />
					<span class="seg-text"><span class="seg-label">Created</span><span class="seg-value">{createdOn(view.created)}</span></span>
				</div>
			</div>
			<button type="button" class="turn up" aria-expanded="true" aria-controls="props-rows" aria-label="Hide properties" data-press="round" onclick={() => (chosen = false)}><Icon name="down" size={16} /></button>
		{:else}
			<button type="button" class="seg summary" aria-expanded="false" aria-controls="props-rows" title={summary} onclick={() => (chosen = true)}>
				<span class="seg-text"><span class="seg-label">Properties</span><span class="seg-value">{summary}</span></span>
				<span class="turn" aria-hidden="true"><Icon name="down" size={16} /></span>
			</button>
		{/if}
	</div>

	{#if open}
		<div class="tags">
			<span class="k" id="tags-k">Tags <span class="n">{view.tags.length}</span></span>
			<div class="tag-row">
				{#if view.tags.length}
					<ul class="chips" aria-labelledby="tags-k">
						{#each view.tags as tag (tag)}
							<li class="chip"><span class="chip-text" lang="de">{tag}</span>&#8288;<button type="button" class="chip-x hit" aria-label={`Remove ${tag}`} data-press="round"><Icon name="close" size={12} /></button></li>
						{/each}
					</ul>
				{/if}
				<div class="add-wrap">
					<label class="add"><span class="sr-only">Add a tag</span><input type="text" class:focus={typing} placeholder="Add a tag" value={typing?.text ?? ''} autocomplete="off" enterkeyhint="done" role="combobox" aria-expanded={typing ? true : false} aria-controls="tag-suggestions" aria-autocomplete="list" aria-activedescendant={typing ? `tag-sug-${typing.active}` : undefined} /></label>
					{#if typing}
						<ul class="suggest" id="tag-suggestions" role="listbox" aria-label="Tag suggestions">
							{#each typing.list as name, i (name)}
								<li id="tag-sug-{i}" role="option" aria-selected={i === typing.active} title={name}><span>{name}</span></li>
							{/each}
						</ul>
						{#if typing.total > typing.list.length}<p class="more-note" role="status">{typing.total} match; the first {typing.list.length} are listed.</p>{/if}
					{/if}
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	.props { display: grid; gap: var(--space-4); min-inline-size: 0; }

	/* the facts ride a glass seg bar on the field; the note's icon is its round first stop */
	.facts.seg-bar { flex-wrap: nowrap; align-items: center; gap: var(--space-1); min-inline-size: 0; padding: var(--space-1-5); }
	.facts:not(.open) { justify-self: start; max-inline-size: 100%; }
	.facts.open { justify-self: start; max-inline-size: 100%; }
	.icon {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--seg-height);
		block-size: var(--seg-height);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		font-size: var(--type-title-size);
		line-height: 1;
	}
	.icon.none { background: var(--surface-control-solid); box-shadow: none; color: var(--ink-secondary); }
	@media (hover: hover) {
		.icon:hover { background: var(--surface-control-solid-hover); }
	}
	.cells { display: flex; flex-wrap: wrap; align-items: stretch; flex: 1; min-inline-size: 0; }
	.cells > .seg { flex: 0 1 auto; min-inline-size: 0; }
	.cells > .pick { flex: 0 1 auto; max-inline-size: 22rem; }
	.facts .seg { position: relative; border: 0; background: transparent; box-shadow: none; color: var(--ink); text-align: start; border-radius: var(--radius-pill); }
	/* hairlines between the cells are drawn apart from the cell, so a rounded cell never bends them */
	.cells > .seg + .seg::before { content: ""; position: absolute; inset-block: var(--space-2); inset-inline-start: 0; inline-size: var(--stroke-hairline); background: var(--hairline); }
	.facts .seg > :global(svg) { flex: none; }
	.seg-value { overflow-wrap: anywhere; }
	.path { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	@media (hover: hover) {
		.facts button.seg:hover { background: var(--surface-tint); }
	}
	.dot {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-7);
		block-size: var(--space-7);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.pin[aria-checked="true"] .dot { background: var(--surface-inverse); box-shadow: none; color: var(--ink-on-inverse); }
	.summary { flex: 1; min-inline-size: 0; }
	.summary .seg-value { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.turn {
		display: grid;
		place-items: center;
		flex: none;
		margin-inline-start: auto;
		inline-size: max(var(--control-height-xs), var(--target));
		block-size: max(var(--control-height-xs), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-control-solid);
		color: var(--ink);
	}
	.turn.up { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.turn.up :global(svg) { transform: rotate(180deg); }
	@media (hover: hover) {
		.summary:hover .turn { background: var(--surface-control-solid-hover); }
		.turn.up:hover { background: var(--surface-inverse-hover); }
	}

	.tags { display: grid; gap: var(--space-2); min-inline-size: 0; padding-inline-start: var(--space-3-5); box-shadow: var(--rule-start); }
	.k {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.k .n { margin-inline-start: var(--space-1); color: var(--ink); font-variant-numeric: var(--numeric-figures); }
	.tag-row { display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--space-2) var(--space-3); min-inline-size: 0; }
	.chips { display: flex; flex-wrap: wrap; gap: var(--space-1-5); min-inline-size: 0; max-inline-size: 100%; }
	.chip {
		display: block;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-0-5) var(--space-0-5) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		font-size: var(--type-label-size);
		line-height: calc(var(--target-min) + var(--space-0-5));
		font-weight: var(--type-label-weight);
	}
	.chip-text { overflow-wrap: anywhere; hyphens: auto; }
	.chip-x { position: relative; display: inline-grid; place-items: center; inline-size: var(--target-min); block-size: var(--target-min); margin-inline-start: var(--space-1); padding: 0; border: 0; border-radius: var(--radius-round); background: var(--surface-control-solid); color: var(--ink); vertical-align: middle; }
	@media (max-width: 1099px), (pointer: coarse) {
		.chip-x { inline-size: var(--target-touch); block-size: var(--target-touch); margin: calc((var(--target-min) - var(--target-touch)) / 2) calc((var(--target-min) - var(--target-touch)) / 2) calc((var(--target-min) - var(--target-touch)) / 2) calc((var(--target-min) - var(--target-touch)) / 2 + var(--space-1)); background: transparent; }
		.chip-x::after { content: ""; position: absolute; inset: calc((var(--target-touch) - var(--target-min)) / 2); border-radius: var(--radius-round); background: var(--surface-control-solid); }
		.chip-x :global(svg) { position: relative; z-index: var(--z-raised); }
		.chips { gap: var(--space-3); }
	}
	@media (hover: hover) {
		.chip-x:hover { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	}
	.add-wrap { display: grid; gap: var(--space-1); flex: 1 1 12rem; max-inline-size: min(100%, 18rem); min-inline-size: 0; }
	.add { display: block; min-inline-size: 0; }
	.add input { inline-size: 100%; min-block-size: max(var(--control-height-xs), var(--target)); padding-inline: var(--space-3-5); border: 0; border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--ring-control); font-size: var(--type-body-s-size); }
	.add input::placeholder { color: var(--ink-muted); opacity: 1; }
	.add input.focus { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	@media (pointer: coarse) {
		.add input { font-size: var(--type-body-size); }
	}
	.suggest { display: grid; gap: var(--space-0-5); min-inline-size: 0; padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.suggest li { display: flex; align-items: center; min-inline-size: 0; min-block-size: max(var(--control-height-xs), var(--target)); padding-inline: var(--space-3); border-radius: var(--radius-item); font-size: var(--type-body-s-size); }
	.suggest li span { min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.suggest li[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.more-note { padding-inline: var(--space-2); color: var(--ink-secondary); font-size: var(--type-caption-size); line-height: var(--type-caption-line); }

	/* phone and tablet: folded, the bar keeps its row; open, the icon, the folder and the fold button share the first row and the dates and Pinned stack below */
	@media (max-width: 1099px) {
		.facts.seg-bar { display: flex; }
		.facts:not(.open) { justify-self: stretch; }
		.facts.open.seg-bar { display: grid; grid-template-columns: var(--seg-height) repeat(2, minmax(0, 1fr)) auto; grid-template-areas: "icon folder folder turn" "edited edited edited edited" "pin pin created created"; align-items: center; justify-self: stretch; }
		.cells { display: contents; }
		.icon { grid-area: icon; }
		.turn.up { grid-area: turn; }
		.cells > .pick { grid-area: folder; max-inline-size: none; }
		.cells > .edited { grid-area: edited; }
		.cells > .pin { grid-area: pin; }
		.cells > .created { grid-area: created; }
		.cells > .seg { align-self: stretch; padding-inline: var(--space-3); }
		.cells > .seg + .seg::before { inset-block: 0 auto; inset-inline: var(--space-3); inline-size: auto; block-size: var(--stroke-hairline); }
	}
</style>
