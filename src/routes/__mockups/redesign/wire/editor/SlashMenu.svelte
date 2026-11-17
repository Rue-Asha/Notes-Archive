<script lang="ts">
	type Props = { query?: string; active?: number; emptyResult?: boolean };
	let { query = '', active = 0, emptyResult = false }: Props = $props();

	const items = [
		['Text', 'Plain paragraph'],
		['Heading 1', 'Large section heading'],
		['Heading 2', 'Medium section heading'],
		['Heading 3', 'Small section heading'],
		['Bullet list', 'Simple bulleted list'],
		['Numbered list', 'Numbered list'],
		['Task list', 'Checklist with tasks'],
		['Quote', 'Quoted passage'],
		['Code', 'Code with highlighting'],
		['Divider', 'Horizontal rule'],
		['Toggle', 'Collapsible section'],
		['Callout', 'Highlighted note'],
		['Table', '3 × 3 with header row'],
		['Image', 'Upload or paste a picture'],
		['File', 'Attach a file']
	];
	const shown = $derived(emptyResult ? [] : query ? items.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())) : items);
</script>

<div class="slash">
	<p class="typed">/{query}</p>
	<div class="menu" role="listbox" aria-label="Blocks">
		{#each shown as [label, hint], i (label)}
			<div class="opt" role="option" aria-selected={i === active}><span class="glyph" aria-hidden="true">{label.slice(0, 1)}</span><span class="t"><span class="l">{label}</span><span class="h">{hint}</span></span></div>
		{:else}
			<p class="none">No results</p>
		{/each}
	</div>
</div>

<style>
	.slash { display: grid; gap: var(--space-1); justify-items: start; min-inline-size: 0; }
	.typed { font-size: var(--type-body-size); color: var(--ink-secondary); }
	.menu { inline-size: min(20rem, 100%); max-block-size: 22rem; overflow-y: auto; padding: var(--space-1-5); border-radius: var(--radius-item); background: var(--surface-raised); box-shadow: var(--ring-hairline); }
	.opt { display: flex; align-items: center; gap: var(--space-3); min-block-size: var(--control-height); padding-inline: var(--space-2); border-radius: var(--radius-text); }
	.opt[aria-selected="true"] { background: var(--surface-tint-strong); }
	.glyph { display: grid; place-items: center; inline-size: var(--control-height-s); block-size: var(--control-height-s); border-radius: var(--radius-text); box-shadow: var(--ring-hairline); font-weight: var(--weight-semibold); flex: none; }
	.t { display: grid; min-inline-size: 0; }
	.l { font-size: var(--type-label-size); font-weight: var(--type-label-weight); }
	.h { font-size: var(--type-caption-size); color: var(--ink-muted); }
	.none { padding: var(--space-3); color: var(--ink-muted); }
</style>
