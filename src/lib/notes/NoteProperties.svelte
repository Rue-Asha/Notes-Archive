<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import type { Note, NotePatch, TagCount, Tree } from '#lib/types.ts';
	import FolderField, { shortPath } from './FolderField.svelte';
	import TagInput from './TagInput.svelte';

	type Props = { note: Note; path: string[]; tree: Tree; tags: TagCount[]; icon: Snippet; onchange(patch: NotePatch): void };

	let { note, path, tree, tags, icon, onchange }: Props = $props();

	// the phone opens folded to one line; the choice sticks until the page is left
	const phone = new MediaQuery('max-width: 767px');
	let chosen = $state<boolean | null>(null);
	const open = $derived(chosen ?? !phone.current);
	const uid = $props.id();

	const stamp = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

	const where = $derived(path.length ? shortPath(path) : 'Root');
	const count = $derived(note.tags.length === 1 ? '1 tag' : `${note.tags.length} tags`);
	const summary = $derived(note.tags.length ? `${where} · ${count}` : where);
</script>

<div class="props" data-properties role="group" aria-label="Properties">
	<div class="facts seg-bar" class:open>
		{@render icon()}
		{#if open}
			<div class="cells" id="{uid}-rows">
				<FolderField folderId={note.folderId} {path} {tree} onchange={(folderId) => onchange({ folderId })} />
				<button type="button" class="seg pin" role="switch" aria-checked={note.pinned} aria-label="Pinned" data-press onclick={() => onchange({ pinned: !note.pinned })}>
					<span class="dot" aria-hidden="true">{#if note.pinned}<Icon name="check" size={14} />{/if}</span>
					<span class="seg-text" aria-hidden="true"><span class="seg-label">Pinned</span><span class="seg-value">{note.pinned ? 'On' : 'Off'}</span></span>
				</button>
				<div class="seg edited">
					<Icon name="clock" size={18} />
					<span class="seg-text"><span class="seg-label">Edited</span><span class="seg-value">{stamp.format(new Date(note.updatedAt))}</span></span>
				</div>
				<div class="seg created">
					<Icon name="note" size={18} />
					<span class="seg-text"><span class="seg-label">Created</span><span class="seg-value">{day.format(new Date(note.createdAt))}</span></span>
				</div>
			</div>
		{/if}
		<!-- one button folds and unfolds, so the focus stays on it either way -->
		<button
			type="button"
			class={open ? 'turn up' : 'seg summary'}
			aria-expanded={open}
			aria-controls={open ? `${uid}-rows` : undefined}
			aria-label={open ? 'Hide properties' : undefined}
			title={open ? undefined : summary}
			data-press={open ? 'round' : undefined}
			onclick={() => (chosen = !open)}
		>
			{#if open}
				<Icon name="chevronDown" size={16} />
			{:else}
				<span class="seg-text"><span class="seg-label">Properties</span><span class="seg-value">{summary}</span></span>
				<span class="turn" aria-hidden="true"><Icon name="chevronDown" size={16} /></span>
			{/if}
		</button>
	</div>

	{#if open}
		<div class="tags">
			<span class="k" id="tags-k">Tags <span class="n">{note.tags.length}</span></span>
			<div class="tag-row">
				<TagInput selected={note.tags.map((t) => t.name)} known={tags} labelledby="tags-k" onchange={(names) => onchange({ tags: names })} />
			</div>
		</div>
	{/if}
</div>

<style>
	.props {
		display: grid;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.facts.seg-bar {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: var(--space-1);
		min-inline-size: 0;
		padding: var(--space-1-5);
	}

	.cells {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		align-items: stretch;
		min-inline-size: 0;
	}

	.cells > :global(.seg) {
		flex: 0 1 auto;
		min-inline-size: 0;
	}

	.cells > :global(.pick) {
		max-inline-size: 22rem;
	}

	.facts :global(.seg) {
		position: relative;
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		box-shadow: none;
		color: var(--ink);
		text-align: start;
	}

	/* the hairlines between cells are drawn apart from the cell, so a rounded cell never bends them */
	.cells > :global(.seg + .seg)::before {
		content: '';
		position: absolute;
		inset-block: var(--space-2);
		inset-inline-start: 0;
		inline-size: var(--stroke-hairline);
		background: var(--hairline);
	}

	.facts :global(.seg > svg) {
		flex: none;
	}

	.seg-value {
		overflow-wrap: anywhere;
	}

	@media (hover: hover) {
		.facts :global(button.seg:hover) {
			background: var(--surface-tint);
		}
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

	.pin[aria-checked='true'] .dot {
		background: var(--surface-inverse);
		box-shadow: none;
		color: var(--ink-on-inverse);
	}

	.summary {
		flex: 1;
		min-inline-size: 0;
	}

	.summary .seg-value {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

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

	.turn.up {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.turn.up :global(svg) {
		transform: rotate(180deg);
	}

	@media (hover: hover) {
		.summary:hover .turn {
			background: var(--surface-control-solid-hover);
		}

		.turn.up:hover {
			background: var(--surface-inverse-hover);
		}
	}

	.tags {
		display: grid;
		gap: var(--space-2);
		min-inline-size: 0;
		padding-inline-start: var(--space-3-5);
		box-shadow: var(--rule-start);
	}

	.k {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	.k .n {
		margin-inline-start: var(--space-1);
		color: var(--ink);
		font-variant-numeric: var(--numeric-figures);
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: var(--space-2) var(--space-3);
		min-inline-size: 0;
	}

	/* phone and tablet: folded, the bar keeps its row; open, the icon, the folder and the fold button share the first row
	   and the dates and Pinned stack below */
	@media (max-width: 1099px) {
		.facts:not(.open) {
			justify-self: stretch;
		}

		.facts.open.seg-bar {
			display: grid;
			grid-template-columns: var(--seg-height) repeat(2, minmax(0, 1fr)) auto;
			grid-template-areas: 'icon folder folder turn' 'edited edited edited edited' 'pin pin created created';
			align-items: center;
			justify-self: stretch;
		}

		.cells {
			display: contents;
		}

		.facts.open > :global(.icon) {
			grid-area: icon;
		}

		.turn.up {
			grid-area: turn;
		}

		.cells > :global(.pick) {
			grid-area: folder;
			max-inline-size: none;
		}

		.cells > .edited {
			grid-area: edited;
		}

		.cells > .pin {
			grid-area: pin;
		}

		.cells > .created {
			grid-area: created;
		}

		.cells > :global(.seg) {
			align-self: stretch;
			padding-inline: var(--space-3);
		}

		.cells > :global(.seg + .seg)::before {
			inset-block: 0 auto;
			inset-inline: var(--space-3);
			inline-size: auto;
			block-size: var(--stroke-hairline);
		}
	}
</style>
