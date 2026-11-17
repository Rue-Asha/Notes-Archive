<script lang="ts">
	import Icon from '../note/Icon.svelte';
	import { COLOURS } from './data.ts';

	type Props = { mode?: 'format' | 'link' | 'colour' };
	let { mode = 'format' }: Props = $props();

	const marks = [
		['Bold', 'bold', true],
		['Italic', 'italic', false],
		['Strikethrough', 'strike', false],
		['Inline code', 'code', false]
	] as const;
</script>

<div class="bubble" class:wide={mode !== 'format'} class:link={mode === 'link'} role="toolbar" aria-label="Format">
	{#if mode === 'format'}
		<span class="grp">
			{#each marks as [label, icon, on] (label)}
				<button type="button" class="m" aria-label={label} aria-pressed={on} data-press="round"><Icon name={icon} /></button>
			{/each}
		</span>
		<span class="grp cell">
			<button type="button" class="m" aria-label="Link" data-press="round"><Icon name="link" /></button>
			<button type="button" class="m" aria-label="Text colour" data-press="round"><Icon name="colour" /></button>
		</span>
	{:else if mode === 'link'}
		<label class="field"><Icon name="link" size={16} /><span class="sr-only">Link URL</span><input type="url" placeholder="Paste or type a link" value="berlin.de" /></label>
		<span class="grp cell">
			<button type="button" class="m text quiet">Remove link</button>
			<button type="button" class="m text apply" data-press data-focus="halo">Apply link<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></button>
		</span>
	{:else}
		<button type="button" class="m" aria-label="Close colours" data-press="round"><Icon name="back" /></button>
		<span class="grp cell swatches">
			<button type="button" class="m text" aria-pressed="true"><span class="chip default"></span>Default</button>
			{#each COLOURS as name (name)}
				<button type="button" class="m text" aria-pressed="false"><span class="chip" data-swatch={name}></span>{name}</button>
			{/each}
		</span>
	{/if}
</div>

<style>
	.bubble {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1);
		inline-size: fit-content;
		max-inline-size: 100%;
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}
	.bubble.wide { border-radius: var(--radius-bar-compact); }
	.wide .cell { padding-inline-start: 0; box-shadow: none; }
	.link { flex-direction: column; align-items: stretch; padding: var(--space-1-5); }
	.link .cell { justify-content: flex-end; }
	.grp { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-0-5); min-inline-size: 0; }
	.cell { padding-inline-start: var(--space-1); box-shadow: var(--rule-beside); }
	.m {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-inline-size: max(var(--control-height-s), var(--target));
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-2);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.m:not(.text) { padding: 0; border-radius: var(--radius-round); }
	.m.text { padding-inline: var(--space-3-5); }
	.m[aria-pressed="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.apply { padding-inline: var(--space-4) var(--space-1); gap: var(--space-2-5); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.m.text.apply { padding-inline: var(--space-4) var(--space-1); }
	.apply:focus-visible { outline-color: var(--focus-ring-on-inverse); box-shadow: var(--focus-halo); }
	.circle { display: grid; place-items: center; inline-size: calc(max(var(--control-height-s), var(--target)) - var(--space-2)); block-size: calc(max(var(--control-height-s), var(--target)) - var(--space-2)); border-radius: var(--radius-round); background: var(--surface-raised); color: var(--ink); }
	.chip { display: block; flex: none; inline-size: var(--space-3-5); block-size: var(--space-3-5); border-radius: var(--radius-round); box-shadow: var(--ring-hairline); }
	.chip.default { background: var(--ink); }
	[aria-pressed="true"] .chip { box-shadow: var(--ring-on-inverse); }
	[data-swatch="stone"] { background: var(--text-stone); }
	[data-swatch="clay"] { background: var(--text-clay); }
	[data-swatch="ochre"] { background: var(--text-ochre); }
	[data-swatch="moss"] { background: var(--text-moss); }
	[data-swatch="sea"] { background: var(--text-sea); }
	[data-swatch="plum"] { background: var(--text-plum); }
	.field { display: flex; align-items: center; gap: var(--space-2); flex: 1 1 auto; min-inline-size: min(16rem, 100%); padding-inline: var(--space-4); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--ring-control); color: var(--ink-secondary); }
	.field input { flex: 1; min-inline-size: 0; min-block-size: max(var(--control-height-s), var(--target)); padding: 0; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--ink); font-size: var(--type-body-s-size); }
	.field input::placeholder { color: var(--ink-muted); opacity: 1; }
	.field:has(input:focus-visible) { border-radius: var(--radius-pill); outline: var(--focus-width) solid var(--focus-ring); }
	.field input:focus-visible { outline: none; }
	@media (max-width: 480px) {
		.bubble { border-radius: var(--radius-bar-compact); }
		.cell { padding-inline-start: 0; box-shadow: none; }
		.bubble { justify-content: center; }
		.swatches { justify-content: center; }
	}
	@media (hover: hover) {
		.m:not([aria-pressed="true"]):not(.apply):hover { background: var(--surface-tint); }
		.apply:hover { background: var(--surface-inverse-hover); }
	}
</style>
