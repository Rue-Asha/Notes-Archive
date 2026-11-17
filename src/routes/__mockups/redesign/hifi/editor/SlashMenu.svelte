<script lang="ts">
	import Icon from '../note/Icon.svelte';
	import NoMatch from '../ui/NoMatch.svelte';

	type Props = { query?: string; active?: number; emptyResult?: boolean };
	let { query = '', active = 0, emptyResult = false }: Props = $props();

	type Group = { name: string; icon: 'text' | 'list' | 'grid' | 'image'; items: string[] };
	const groups: Group[] = [
		{ name: 'Text', icon: 'text', items: ['Text', 'Heading 1', 'Heading 2', 'Heading 3', 'Quote'] },
		{ name: 'Lists', icon: 'list', items: ['Bullet list', 'Numbered list', 'Task list'] },
		{ name: 'Blocks', icon: 'grid', items: ['Code', 'Callout', 'Toggle', 'Table', 'Divider'] },
		{ name: 'Media', icon: 'image', items: ['Image', 'File'] }
	];
	const total = groups.reduce((n, g) => n + g.items.length, 0);
	const pad = (n: number) => String(n).padStart(String(total).length, '0');

	const numbered = groups.map((g) => ({ ...g, items: g.items.map((label) => ({ label })) }));
	const shown = $derived(
		emptyResult ? [] : numbered.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())) })).filter((g) => g.items.length)
	);
	const flat = $derived(shown.flatMap((g) => g.items));
	const current = $derived(flat[active]);
	const currentGroup = $derived(shown.find((g) => g.items.includes(current))?.name);
</script>

<div class="slash">
	<p class="typed">/{query}<span class="caret" aria-hidden="true"></span></p>
	<div class="sheet">
		<div class="sheet-head">
			<ul class="kicker"><li>Blocks</li><li>{query ? `“${query}”` : 'All'}</li></ul>
			{#if flat.length}
				<span class="position"><span class="sr-only">Block </span>{pad(flat.indexOf(current) + 1)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true">{' / '}</span>{pad(flat.length)}</span></span>
			{/if}
		</div>
		<div class="sheet-body" class:solo={query || !flat.length}>
			{#if !query && flat.length}
				<div class="jump" role="group" aria-label="Jump to a group">
					{#each shown as g (g.name)}
						<button type="button" class="jump-item" aria-label={g.name} aria-current={g.name === currentGroup || undefined} data-press="round"><Icon name={g.icon} size={16} /></button>
					{/each}
				</div>
			{/if}
			<div class="menu" role="listbox" aria-label="Blocks">
				{#each shown as g (g.name)}
					<div class="group" role="group" aria-label={g.name}>
						<p class="group-name" aria-hidden="true">{g.name}</p>
						{#each g.items as item (item.label)}
							<div class="opt" role="option" aria-selected={item === current}>
								<span class="pos" aria-hidden="true">{pad(flat.indexOf(item) + 1)}</span>
								<span class="l">{item.label}</span>
								{#if item === current}<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span>{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="none"><NoMatch lead="No results" {query} /></div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.slash { display: grid; gap: var(--space-1-5); justify-items: start; min-inline-size: 0; inline-size: 100%; }
	.typed { font-size: var(--type-body-size); color: var(--ink-secondary); }
	.caret { display: inline-block; inline-size: var(--stroke-rule); block-size: 1em; margin-inline-start: var(--space-0-5); vertical-align: text-bottom; background: var(--accent); }
	.sheet {
		display: grid;
		gap: var(--space-2);
		inline-size: min(21rem, 100%);
		padding: var(--space-3) var(--space-2) var(--space-2);
		border-radius: var(--radius-card-s);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}
	.sheet-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding-inline: var(--space-3); min-inline-size: 0; }
	.sheet-head .kicker { min-inline-size: 0; }
	.sheet-body { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-1-5); align-items: start; }
	.sheet-body.solo { grid-template-columns: minmax(0, 1fr); }
	.jump {
		position: sticky;
		inset-block-start: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
	}
	.jump-item {
		display: grid;
		place-items: center;
		inline-size: max(var(--control-height-xs), var(--target));
		block-size: max(var(--control-height-xs), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-secondary);
	}
	.jump-item[aria-current] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	@media (hover: hover) {
		.jump-item:not([aria-current]):hover { background: var(--surface-tint); color: var(--ink); }
	}
	.menu { display: grid; gap: var(--space-2); max-block-size: 22rem; overflow-y: auto; overscroll-behavior: contain; min-inline-size: 0; padding: var(--space-1); border-radius: var(--radius-panel); background: var(--surface-raised); }
	.group { display: grid; gap: var(--space-0-5); }
	.group-name {
		margin: var(--space-1) var(--space-2) var(--space-1);
		padding-inline-start: var(--space-2-5);
		box-shadow: var(--rule-start);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	.opt {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3) var(--space-1-5);
		border-radius: var(--radius-pill);
	}
	.pos { flex: none; min-inline-size: 2ch; font-size: var(--type-caption-size); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); letter-spacing: 0.06em; }
	.l { flex: 1; min-inline-size: 0; font-size: var(--type-label-size); font-weight: var(--type-label-weight); }
	.opt[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.opt[aria-selected="true"] .pos { color: var(--ink-on-inverse-secondary); }
	.circle { display: grid; place-items: center; flex: none; inline-size: var(--space-7); block-size: var(--space-7); border-radius: var(--radius-round); background: var(--surface-raised); color: var(--ink); }
	@media (hover: hover) {
		.opt:not([aria-selected="true"]):hover { background: var(--surface-sunken); }
	}
	.none { padding: var(--space-4) var(--space-3); }
</style>
