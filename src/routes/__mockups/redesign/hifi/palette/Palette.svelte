<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from '../search/Icon.svelte';
	import NoMatch from '../ui/NoMatch.svelte';
	import { cueY } from '#lib/components/scroll-cue/cue.ts';
	import { ago, parts, plural } from '../search/data.ts';

	type Props = {
		state: 'empty' | 'typing' | 'nohits';
		query?: string;
		recent: MockCard[];
		hits?: MockCard[];
		phone?: boolean;
		id: string;
	};
	let { state: mode, query = '', recent, hits = [], phone = false, id }: Props = $props();

	type Scope = 'all' | 'notes' | 'actions';
	let scope = $state<Scope>('all');

	const notes = $derived(mode === 'empty' ? recent.slice(0, 8) : mode === 'typing' ? hits.slice(0, 8) : []);
	const actions = [
		{ label: 'New note', icon: 'plus' as const },
		{ label: 'New folder', icon: 'folderPlus' as const }
	];
	const actionCount = $derived(actions.length + (mode === 'typing' ? 1 : 0));
	const pad = (n: number) => String(n).padStart(Math.max(2, String(notes.length).length), '0');
	const scopes = $derived<[Scope, string, number | null][]>([
		['all', 'All', null],
		['notes', mode === 'empty' ? 'Recent' : 'Notes', notes.length],
		['actions', 'Actions', actionCount]
	]);
</script>

<div class="palette" class:phone role="dialog" aria-label="Search" aria-modal="true">
	<div class="field-row">
		<label class="field">
			<Icon name="search" size={18} />
			<input type="search" value={query} placeholder="Search notes" aria-label="Search notes" />
			<kbd class="hint" aria-hidden="true">Esc</kbd>
		</label>
		{#if phone}
			<button class="close" type="button" aria-label="Close" data-press="round"><Icon name="close" size={18} /></button>
		{/if}
	</div>

	<div class="scopes" role="group" aria-label="Show" data-pill>
		{#each scopes as [key, label, n] (key)}
			<button type="button" class="scope" aria-pressed={scope === key} data-press onclick={() => (scope = key)}>
				{label}{#if n !== null}<span class="n">{pad(n)}</span>{/if}
			</button>
		{/each}
	</div>

	<div class="body-host">
	<div class="body hf-scroll-y" role="listbox" aria-label="Results" use:cueY>
		{#if scope !== 'actions'}
			{#if notes.length}
				<section aria-labelledby="{id}-notes">
					<div class="head">
						<h3 class="ruled" id="{id}-notes">{#if mode === 'empty'}Recent{:else}Notes <span class="count">· {plural(notes.length, 'result')}</span>{/if}</h3>
						<span class="position"><span class="sr-only">Note </span>{pad(1)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true">{' / '}</span>{pad(notes.length)}</span></span>
					</div>
					<ul>
						{#each notes as card, i (card.id)}
							<li class="row" class:hit={mode === 'typing'} role="option" aria-selected={i === 0}>
								<span class="pos" aria-hidden="true">{pad(i + 1)}</span>
								<span class="stack">
									<span class="title">{#if card.icon}<span class="emoji" aria-hidden="true">{card.icon}</span>{/if}{card.title || 'Untitled'}</span>
									{#if mode === 'typing'}
										<span class="snippet">{#each parts(card.snippet, query) as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
									{/if}
								</span>
								<span class="end">
									{#if mode === 'empty'}<span class="aside">{ago(i)}</span>{/if}
									{#if i === 0}<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span>{/if}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{:else if mode === 'nohits'}
				<div class="none"><NoMatch lead="No notes match" {query} /></div>
			{/if}
		{/if}

		{#if scope !== 'notes'}
			<section aria-labelledby="{id}-actions">
				<div class="head"><h3 class="ruled" id="{id}-actions">Actions</h3></div>
				<ul>
					{#each actions as a (a.label)}
						<li class="row act" role="option" aria-selected="false">
							<span class="dot" aria-hidden="true"><Icon name={a.icon} size={16} /></span>
							<span class="title">{a.label}</span>
						</li>
					{/each}
					{#if mode === 'typing'}
						<li class="see-all" role="option" aria-selected="false">See all results<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></li>
					{/if}
				</ul>
			</section>
		{/if}
	</div>
	</div>
</div>

<style>
	.palette {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto minmax(0, 1fr);
		gap: var(--space-2-5);
		inline-size: min(100%, calc(var(--measure) * 0.85));
		max-block-size: 52rem;
		margin-inline: auto;
		padding: var(--space-2-5);
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		min-inline-size: 0;
	}
	.palette.phone {
		inline-size: 100%;
		max-block-size: none;
		block-size: 100%;
		padding: var(--space-3) var(--space-3-5);
		border-radius: 0;
		box-shadow: none;
		background: var(--surface-frame-strong);
	}

	.field-row { display: flex; align-items: center; gap: var(--space-2); min-inline-size: 0; }
	.field {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-inline-size: 0;
		padding-inline: var(--space-5) var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-secondary);
	}
	.field:has(input:focus-visible) { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--ink);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}
	input:focus-visible { outline: none; }
	input::placeholder { color: var(--ink-muted); opacity: 1; }
	.hint {
		display: none;
		flex: none;
		place-items: center;
		min-block-size: var(--space-7);
		padding-inline: var(--space-2-5);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink-secondary);
		font-family: var(--font-ui);
		font-size: var(--type-caption-size);
	}
	@media (pointer: fine) and (min-width: 768px) {
		.palette:not(.phone) .hint { display: grid; }
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height), var(--target));
		block-size: max(var(--control-height), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		color: var(--ink);
	}

	.scopes {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		gap: var(--space-1);
		justify-self: start;
		max-inline-size: 100%;
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-glass);
		box-shadow: var(--shadow-rim);
	}
	.scope {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height-xs), var(--target));
		padding-inline: var(--space-4);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.scope .n { font-size: var(--type-caption-size); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); letter-spacing: 0.06em; }
	.scope[aria-pressed="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.scope[aria-pressed="true"] .n { color: var(--ink-on-inverse-secondary); }
	.scope { flex: none; }
	@media (max-width: 480px) {
		.scope { padding-inline: var(--space-3); }
	}
	.phone .scope { padding-inline: var(--space-3); }
	@media (hover: hover) {
		.scope[aria-pressed="false"]:hover { background: var(--surface-hover); }
	}

	.body-host { display: grid; min-block-size: 0; }
	.body {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-3) var(--space-2) var(--space-2);
		border-radius: var(--radius-card-s);
		background: var(--surface-raised);
		overflow-y: auto;
		overscroll-behavior: contain;
		min-block-size: 0;
		container-type: inline-size;
	}
	@container (max-width: 22rem) {
		.row[aria-selected="true"] .aside { display: none; }
	}
	section { display: grid; gap: var(--space-1); }
	.head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); padding-inline: var(--space-2) var(--space-3); margin-block-end: var(--space-1); }
	.ruled { color: var(--ink-secondary); }
	.count { letter-spacing: normal; text-transform: none; font-weight: var(--weight-regular); font-variant-numeric: var(--numeric-figures); }
	ul { display: grid; gap: var(--space-0-5); }
	.row {
		display: grid;
		grid-template-columns: 2.5ch minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-3);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-3-5);
		border-radius: var(--radius-panel);
	}
	.row.act { grid-template-columns: auto minmax(0, 1fr); padding-inline-start: var(--space-1-5); }
	.row[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.row[aria-selected="true"] :is(.snippet, .aside, .pos) { color: var(--ink-on-inverse-secondary); }
	.row[aria-selected="true"] mark { background: var(--surface-inverse-tint-strong); color: var(--ink-on-inverse); }
	@media (hover: hover) {
		.row:not([aria-selected="true"]):hover { background: var(--surface-sunken); }
	}
	.pos { align-self: start; font-size: var(--type-caption-size); line-height: var(--type-title-line); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); letter-spacing: 0.06em; }
	.row:not(.hit) .pos { align-self: center; }
	.stack { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.title {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		min-inline-size: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.emoji { margin-inline-end: var(--space-1-5); }
	.snippet {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.end { display: flex; align-items: center; gap: var(--space-3); }
	.end:empty { display: none; }
	.aside { padding-inline-end: var(--space-2); color: var(--ink-secondary); font-size: var(--type-caption-size); white-space: nowrap; font-variant-numeric: var(--numeric-figures); }
	mark { background: var(--accent-soft); color: var(--ink); font-weight: var(--weight-semibold); border-radius: var(--radius-text); padding-inline: var(--space-0-5); }
	.aside:has(+ .circle) { padding-inline-end: 0; }
	.circle { display: grid; place-items: center; flex: none; inline-size: var(--space-8); block-size: var(--space-8); border-radius: var(--radius-round); background: var(--surface-raised); color: var(--ink); }
	.dot { display: grid; place-items: center; inline-size: var(--space-8); block-size: var(--space-8); border-radius: var(--radius-round); background: var(--surface-control-solid); }
	.see-all {
		display: inline-flex;
		align-items: center;
		justify-self: start;
		gap: var(--space-3);
		margin: var(--space-2) 0 0 var(--space-1-5);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-5);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.none { padding: var(--space-5) var(--space-3); }
</style>
