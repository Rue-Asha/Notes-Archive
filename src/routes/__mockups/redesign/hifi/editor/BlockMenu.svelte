<script lang="ts">
	import Icon from '../note/Icon.svelte';

	type Props = { first?: boolean; last?: boolean; turnInto?: boolean; total?: number };
	let { first = false, last = false, turnInto = false, total = 12 }: Props = $props();

	const turn = ['Text', 'Heading 1', 'Heading 2', 'Heading 3', 'Bullet list', 'Numbered list', 'Task list', 'Quote', 'Code', 'Callout'];
	const at = $derived(first ? 1 : last ? total : 4);
	const pad = (n: number) => String(n).padStart(Math.max(2, String(total).length), '0');
</script>

<div class="wrap">
	<button type="button" class="handle" aria-label="Block actions" aria-haspopup="menu" aria-expanded="true" data-press="round"><Icon name="grip" /></button>
	<div class="box">
		<p class="head"><span class="position"><span class="sr-only">Block </span>{pad(at)}<span class="of"><span class="sr-only"> of </span><span aria-hidden="true">{' / '}</span>{pad(total)}</span></span><span class="what">Paragraph</span></p>
		<ul class="menu" role="menu" aria-label="Block menu">
			<li role="none"><button type="button" role="menuitem" class="item" disabled={first}><Icon name="up" size={16} />Move up</button></li>
			<li role="none"><button type="button" role="menuitem" class="item" disabled={last}><Icon name="down" size={16} />Move down</button></li>
			<li role="none"><button type="button" role="menuitem" class="item" aria-haspopup="menu" aria-expanded={turnInto}>Turn into<span class="end"><Icon name="chevron" size={16} /></span></button></li>
			<li class="rule" role="separator"></li>
			<li role="none"><button type="button" role="menuitem" class="item danger"><Icon name="trash" size={16} />Delete</button></li>
		</ul>
	</div>
	{#if turnInto}
		<ul class="menu turn" role="menu" aria-label="Turn into">
			{#each turn as label, i (label)}
				<li role="none"><button type="button" role="menuitemradio" class="item" aria-checked={i === 0}><span class="check"><Icon name="check" size={14} /></span>{label}</button></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.wrap { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-2); align-items: flex-start; }
	.handle { display: grid; place-items: center; inline-size: max(var(--control-height-s), var(--target)); block-size: max(var(--control-height-s), var(--target)); padding: 0; border: 0; border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.box { display: grid; min-inline-size: 13rem; max-inline-size: 100%; border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.head { display: flex; align-items: baseline; gap: var(--space-2-5); padding: var(--space-3) var(--space-4) var(--space-2-5); box-shadow: var(--rule-below); }
	.what { font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.menu { display: grid; gap: var(--space-0-5); padding: var(--space-1-5); }
	.turn { min-inline-size: 12rem; max-inline-size: 100%; border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.item { display: flex; align-items: center; gap: var(--space-2-5); inline-size: 100%; min-block-size: max(var(--control-height-s), var(--target)); padding: 0 var(--space-3-5) 0 var(--space-3); border: 0; border-radius: var(--radius-pill); background: transparent; text-align: start; font-size: var(--type-body-s-size); }
	.item:disabled { opacity: var(--disabled-opacity); cursor: default; }
	.item.danger { color: var(--danger); }
	.end { margin-inline-start: auto; display: grid; }
	.check { display: grid; place-items: center; inline-size: var(--space-5); block-size: var(--space-5); border-radius: var(--radius-round); color: transparent; }
	.item[aria-checked="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.item[aria-checked="true"] .check { background: var(--surface-raised); box-shadow: none; color: var(--ink); }
	.item:focus-visible { outline-offset: calc(-1 * var(--focus-width)); }
	.rule { block-size: var(--stroke-hairline); margin: var(--space-1) var(--space-2); background: var(--hairline); }
	@media (hover: hover) {
		.item:not(:disabled):not([aria-checked="true"]):hover { background: var(--surface-sunken); }
	}
</style>
