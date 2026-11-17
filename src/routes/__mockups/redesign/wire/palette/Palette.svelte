<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import { ago, parts, plural } from '../search/data.ts';

	type Props = {
		state: 'empty' | 'typing' | 'nohits';
		query?: string;
		recent: MockCard[];
		hits?: MockCard[];
		phone?: boolean;
	};
	let { state, query = '', recent, hits = [], phone = false }: Props = $props();

	const shown = $derived(hits.slice(0, 8));
	const actions = ['New note', 'New folder'];
</script>

<div class="palette" class:phone role="dialog" aria-label="Search" aria-modal="true">
	<div class="bar">
		<span class="glass" aria-hidden="true">⌕</span>
		<input type="search" value={query} placeholder="Search notes" aria-label="Search notes" />
		{#if phone}
			<button class="close" type="button">Close</button>
		{:else}
			<kbd class="esc" aria-hidden="true">esc</kbd>
		{/if}
	</div>

	<div class="body" role="listbox" aria-label="Results">
		{#if state === 'empty'}
			<section aria-labelledby="p-recent-{phone}">
				<h3 class="type-overline ruled" id="p-recent-{phone}">Recent</h3>
				<ul>
					{#each recent.slice(0, 8) as card, i (card.id)}
						<li class="row" role="option" aria-selected={i === 0} data-current={i === 0 || undefined}>
							<span class="icon" aria-hidden="true">{card.icon ?? ''}</span>
							<span class="title">{card.title || 'Untitled'}</span>
							<span class="aside">{ago(i)}</span>
						</li>
					{/each}
				</ul>
			</section>
		{:else if state === 'typing'}
			<section aria-labelledby="p-notes-{phone}">
				<h3 class="type-overline ruled" id="p-notes-{phone}">Notes · {plural(shown.length, 'result')}</h3>
				<ul>
					{#each shown as card, i (card.id)}
						<li class="row hit" role="option" aria-selected={i === 0} data-current={i === 0 || undefined}>
							<span class="icon" aria-hidden="true">{card.icon ?? ''}</span>
							<span class="stack">
								<span class="title">{card.title || 'Untitled'}</span>
								<span class="snippet">{#each parts(card.snippet, query) as p}{#if p.hit}<mark>{p.text}</mark>{:else}{p.text}{/if}{/each}</span>
							</span>
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="none" role="status">No notes match “{query}”</p>
		{/if}

		<section aria-labelledby="p-actions-{phone}">
			<h3 class="type-overline ruled" id="p-actions-{phone}">Actions</h3>
			<ul>
				{#each actions as a (a)}
					<li class="row" role="option" aria-selected="false">
						<span class="icon" aria-hidden="true">+</span>
						<span class="title">{a}</span>
					</li>
				{/each}
				{#if state !== 'empty'}
					<li class="row" role="option" aria-selected="false">
						<span class="icon" aria-hidden="true">→</span>
						<span class="title">See all results</span>
					</li>
				{/if}
			</ul>
		</section>
	</div>

	{#if !phone}
		<p class="foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p>
	{/if}
</div>

<style>
	.palette {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		inline-size: min(100%, 40rem);
		max-block-size: 46rem;
		margin-inline: auto;
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		overflow: hidden;
		min-inline-size: 0;
	}
	.palette.phone {
		inline-size: 100%;
		max-block-size: none;
		block-size: 100%;
		border-radius: 0;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		box-shadow: var(--rule-below);
	}
	.glass { font-size: var(--type-title-size); color: var(--ink-secondary); }
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: var(--control-height);
		border: 0;
		background: transparent;
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}
	.close, .esc {
		flex: none;
		min-block-size: var(--target);
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		color: var(--ink-secondary);
	}
	.esc {
		display: grid;
		place-items: center;
		min-block-size: var(--space-6);
		font-size: var(--type-caption-size);
	}
	.body {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		padding: var(--space-3);
		overflow-y: auto;
		min-block-size: 0;
	}
	section { display: grid; gap: var(--space-1); }
	.ruled { color: var(--ink-secondary); margin-block-end: var(--space-1); margin-inline-start: var(--space-1); }
	ul { display: grid; gap: var(--space-0-5); }
	.row {
		display: grid;
		grid-template-columns: var(--space-6) minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding: var(--space-1-5) var(--space-3);
		border-radius: var(--radius-item);
	}
	.row.hit { grid-template-columns: var(--space-6) minmax(0, 1fr); align-items: start; }
	.row[data-current] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.row[data-current] .snippet, .row[data-current] .aside { color: var(--ink-on-inverse-secondary); }
	.row[data-current] mark { background: var(--surface-inverse-tint-strong); color: var(--ink-on-inverse); }
	.icon { text-align: center; }
	.stack { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.title {
		font-weight: var(--weight-medium);
		overflow-wrap: anywhere;
		min-inline-size: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
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
	.aside {
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
		white-space: nowrap;
	}
	mark {
		background: var(--surface-tint-strong);
		color: var(--ink);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-text);
	}
	.none {
		padding: var(--space-6) var(--space-3);
		text-align: center;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	.foot {
		display: flex;
		gap: var(--space-5);
		padding: var(--space-2-5) var(--space-4);
		box-shadow: var(--rule-above);
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
	}
	kbd {
		margin-inline-end: var(--space-1);
		padding-inline: var(--space-1-5);
		border-radius: var(--radius-text);
		background: var(--surface-tint);
		font-family: var(--font-ui);
	}
</style>
