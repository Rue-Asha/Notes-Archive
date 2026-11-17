<script lang="ts">
	import Icon from '../note/Icon.svelte';

	type Props = { mode?: 'format' | 'link' | 'colour' };
	let { mode = 'format' }: Props = $props();

	const marks = [
		['Bold', 'B', true],
		['Italic', 'I', false],
		['Strikethrough', 'S', false],
		['Inline code', '</>', false]
	] as const;
	const colours = ['Default', 'stone', 'clay', 'ochre', 'moss', 'sea', 'plum'];
</script>

<div class="bubble" role="toolbar" aria-label="Format">
	{#if mode === 'format'}
		{#each marks as [label, glyph, on] (label)}
			<button type="button" class="m" aria-label={label} aria-pressed={on}>{glyph}</button>
		{/each}
		<button type="button" class="m" aria-label="Link"><Icon name="link" /></button>
		<button type="button" class="m text" aria-label="Text colour">A<span class="bar"></span></button>
	{:else if mode === 'link'}
		<label class="field"><span class="sr-only">Link URL</span><input type="url" placeholder="Paste or type a link" value="berlin.de" /></label>
		<button type="button" class="m text">Apply link</button>
		<button type="button" class="m text">Remove link</button>
	{:else}
		<button type="button" class="m" aria-label="Close colours"><Icon name="back" /></button>
		{#each colours as name (name)}
			<button type="button" class="m text swatch" aria-pressed={name === 'Default'}><span class="chip"></span>{name}</button>
		{/each}
	{/if}
</div>

<style>
	.bubble { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-0-5); inline-size: fit-content; max-inline-size: 100%; padding: var(--space-1); border-radius: var(--radius-item); background: var(--surface-raised); box-shadow: var(--ring-hairline); }
	.m { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-1-5); min-inline-size: var(--control-height-s); min-block-size: var(--control-height-s); padding-inline: var(--space-2); border: 0; border-radius: var(--radius-text); background: transparent; font-size: var(--type-label-size); font-weight: var(--weight-semibold); }
	.m.text { padding-inline: var(--space-3); font-weight: var(--weight-medium); }
	.m[aria-pressed="true"] { background: var(--surface-tint-strong); }
	.m:hover { background: var(--surface-tint); }
	.bar { display: block; inline-size: var(--space-3); block-size: var(--space-0-5); background: var(--ink); align-self: flex-end; }
	.field input { min-block-size: var(--control-height-s); inline-size: min(16rem, 60vw); padding-inline: var(--space-3); border: 0; border-radius: var(--radius-text); background: var(--surface-tint); }
	.chip { display: block; inline-size: var(--space-3); block-size: var(--space-3); border-radius: var(--radius-round); border: var(--stroke-rule) solid var(--ink-secondary); }
</style>
