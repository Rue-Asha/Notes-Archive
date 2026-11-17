<script lang="ts">
	import type { MockBlock } from '../../fixtures.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '../note/Icon.svelte';
	import { cue } from '#lib/components/scroll-cue/cue.ts';
	import { highlight } from './data.ts';

	type Props = { blocks: MockBlock[]; tableActions?: boolean; openToggle?: boolean; handleAt?: number | null };
	let { blocks, tableActions = false, openToggle = false, handleAt = null }: Props = $props();

	const actions = ['Add row below', 'Add column right', 'Delete row', 'Delete column'];
	let toggles = $state<Record<number, boolean>>({});
</script>

<div class="body" role="group" aria-label="Note body">
	{#each blocks as block, i (i)}
		<div class="row" class:handled={handleAt === i}>
			{#if handleAt === i}
				<span class="handle"><Button variant="quiet" size="s" icon aria-label="Block actions"><Icon name="grip" /></Button></span>
			{/if}
			{#if block.type === 'heading'}
				{#if block.level === 1}<h2 class="block h1">{block.text}</h2>
				{:else if block.level === 2}<h3 class="block h2">{block.text}</h3>
				{:else}<h4 class="block h3 ruled">{block.text}</h4>{/if}
			{:else if block.type === 'paragraph'}
				<p class="block">{block.text}</p>
			{:else if block.type === 'bulletList'}
				<ul class="block list bullets">{#each block.items as item (item)}<li>{item}</li>{/each}</ul>
			{:else if block.type === 'orderedList'}
				<ol class="block list numbers">{#each block.items as item (item)}<li>{item}</li>{/each}</ol>
			{:else if block.type === 'taskList'}
				<ul class="block tasks">
					{#each block.items as item (item.text)}
						<li>
							<label class="task">
								<input type="checkbox" checked={item.done} />
								<span class="box" aria-hidden="true"><Icon name="check" size={14} /></span>
								<span class="task-text">{item.text}</span>
							</label>
						</li>
					{/each}
				</ul>
			{:else if block.type === 'quote'}
				<blockquote class="block">{block.text}</blockquote>
			{:else if block.type === 'callout'}
				<aside class="block callout"><button type="button" class="emoji" aria-label="Change emoji" data-press="round"><span aria-hidden="true">💡</span></button><p>{block.text}</p></aside>
			{:else if block.type === 'toggle'}
				{@const open = toggles[i] ?? openToggle}
				<div class="block toggle">
					<button type="button" class="toggle-head" aria-expanded={open} onclick={() => (toggles[i] = !open)}>
						<span class="turn" class:open aria-hidden="true"><Icon name="chevron" size={16} /></span><span class="summary">{block.summary}</span>
					</button>
					{#if open}<div class="toggle-body"><p>{block.text}</p></div>{/if}
				</div>
			{:else if block.type === 'code'}
				<div class="block code" data-surface="inverse">
					<label class="code-lang">
						<span>Language</span>
						<span class="select"><select><option>JavaScript</option><option>Plain text</option></select><Icon name="down" size={14} /></span>
					</label>
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<pre class="scroll-x" role="region" tabindex="0" aria-label="JavaScript code, scrolls sideways"><code>{#each highlight(block.text) as line, n (n)}{#each line as [kind, text], t (t)}<span class={`tok-${kind}`}>{text}</span>{/each}{'\n'}{/each}</code></pre>
				</div>
			{:else if block.type === 'table'}
				<div class="block table-block">
					{#if tableActions}
						<div class="table-actions" role="toolbar" aria-label="Table actions">
							{#each actions as action, n (action)}<button type="button" class="t-act" class:danger={n > 1} disabled={n === 2} data-press>{#if n > 1}<Icon name="trash" size={14} />{:else}<Icon name="plus" size={14} />{/if}{action}</button>{/each}
						</div>
					{/if}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div class="cue-host">
					<div class="scroll-x table" tabindex="0" role="region" aria-label="Table, scrolls sideways" use:cue>
						<table>
							<thead><tr>{#each block.rows[0] as cell, c (c)}<th scope="col">{cell}</th>{/each}</tr></thead>
							<tbody>
								{#each block.rows.slice(1) as row, r (r)}
									<tr>{#each row as cell, c (c)}<td>{cell}</td>{/each}</tr>
								{/each}
							</tbody>
						</table>
					</div>
					</div>
				</div>
			{:else if block.type === 'image'}
				<figure class="block image">
					<div class="plate" role="img" aria-label="Image placeholder"><Icon name="image" size={24} /></div>
					<figcaption><input type="text" aria-label="Caption" placeholder="Caption" value={block.caption} /></figcaption>
				</figure>
			{:else if block.type === 'file'}
				<a class="block file" href="/__mockups/redesign/hifi/editor" title={block.name} data-hover>
					<span class="card-text"><span class="over">PDF · {block.size}</span><span class="name">{block.name}</span></span>
					<span class="circle" aria-hidden="true"><Icon name="download" size={16} /></span>
				</a>
			{:else if block.type === 'linkPreview'}
				<a class="block preview" href="/__mockups/redesign/hifi/editor" data-hover>
					<span class="card-text"><span class="over">{block.host}</span><span class="name">{block.title}</span><span class="desc">A line of the page description, cut after two lines when the page has a long one.</span></span>
					<span class="circle" aria-hidden="true"><Icon name="out" size={16} /></span>
				</a>
			{:else if block.type === 'divider'}
				<hr class="block" />
			{:else}
				<p class="block">{(block as { text?: string }).text ?? ''}</p>
			{/if}
		</div>
	{/each}
</div>

<style>
	.body {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-3-5);
		min-inline-size: 0;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
	}
	.row { position: relative; min-inline-size: 0; }
	.block { min-inline-size: 0; }
	.handle { position: absolute; inset-inline-end: 100%; inset-block-start: 0; margin-inline-end: var(--space-1); }
	@media (max-width: 1099px) {
		.handle { inset-inline-end: 0; z-index: var(--z-raised); }
		.handled > .block { padding-inline-end: var(--control-height); }
	}
	.h1 { margin-block-start: var(--space-3); font-size: var(--type-display-m-size); line-height: var(--type-display-m-line); letter-spacing: var(--type-display-m-tracking); }
	.h2 { margin-block-start: var(--space-2); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); }
	.h1, .h2 { font-family: var(--font-display); font-weight: var(--weight-display); text-wrap: balance; }
	.h3 { margin-block-start: var(--space-3); }
	.list { padding-inline-start: 1.2em; }
	.bullets { list-style: disc; }
	.numbers { padding-inline-start: 1.6em; list-style: decimal; }
	blockquote { padding-inline-start: var(--space-5); box-shadow: var(--rule-start); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); text-wrap: pretty; }
	.tasks { display: grid; gap: var(--space-1); }
	.task { position: relative; display: flex; align-items: flex-start; gap: var(--space-2-5); min-block-size: var(--target); cursor: pointer; }
	.task input { appearance: none; flex: none; inline-size: var(--space-5); block-size: var(--space-5); margin: calc((1lh - var(--space-5)) / 2) 0 0; border-radius: var(--radius-round); background: var(--surface-raised); box-shadow: var(--ring-control); cursor: pointer; }
	.task input:checked { background: var(--surface-inverse); box-shadow: none; }
	.box { position: absolute; inset-inline-start: 3px; inset-block-start: calc((1lh - 14px) / 2); display: flex; color: transparent; pointer-events: none; }
	.task input:checked + .box { color: var(--ink-on-inverse); }
	.task input:checked ~ .task-text { color: var(--ink-secondary); text-decoration: line-through; }
	.callout { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: var(--space-4); padding: var(--space-4) var(--space-6) var(--space-4) var(--space-4); border-radius: var(--radius-panel); background: var(--surface-sunken); }
	.emoji { display: grid; place-items: center; inline-size: max(var(--space-9), var(--target)); block-size: max(var(--space-9), var(--target)); padding: 0; border: 0; border-radius: var(--radius-round); background: var(--surface-raised); box-shadow: var(--ring-hairline); font-size: var(--type-title-size); line-height: 1; }
	.callout p { min-inline-size: 0; padding: calc((max(var(--space-9), var(--target)) - 1lh) / 2) 0 calc((max(var(--space-9), var(--target)) - 1lh) / 2) var(--space-4); box-shadow: var(--rule-start); }
	@media (hover: hover) {
		.emoji:hover { background: var(--surface-control-solid-hover); }
	}
	.toggle-head { display: flex; align-items: center; gap: var(--space-3); min-block-size: max(var(--control-height-s), var(--target)); padding: 0 var(--space-4) 0 0; border: 0; border-radius: var(--radius-pill); background: transparent; text-align: start; }
	.summary { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); }
	.turn { display: inline-grid; place-items: center; flex: none; inline-size: max(var(--control-height-xs), var(--target)); block-size: max(var(--control-height-xs), var(--target)); border-radius: var(--radius-round); background: var(--surface-control-solid); }
	.turn.open { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.turn.open :global(svg) { transform: rotate(90deg); }
	.toggle-body { margin: var(--space-2) 0 0 calc(max(var(--control-height-xs), var(--target)) / 2); padding: var(--space-1) 0 var(--space-1) calc(max(var(--control-height-xs), var(--target)) / 2 + var(--space-3)); box-shadow: var(--rule-start); }
	@media (hover: hover) {
		.toggle-head:hover .turn:not(.open) { background: var(--surface-control-solid-hover); }
	}

	.code { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2); padding: var(--space-3) var(--space-3-5); border-radius: var(--radius-panel); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.code-lang { display: flex; align-items: center; gap: var(--space-2); justify-self: start; font-size: var(--type-caption-size); color: var(--ink-on-inverse-secondary); }
	.select { position: relative; display: inline-flex; align-items: center; }
	.select select { appearance: none; min-block-size: max(28px, var(--target)); padding: 0 var(--space-7) 0 var(--space-3); border: 0; border-radius: var(--radius-pill); background: var(--surface-inverse-raised); box-shadow: var(--ring-control-on-inverse); color: var(--ink-on-inverse); font-size: var(--type-caption-size); }
	.select :global(svg) { position: absolute; inset-inline-end: var(--space-2-5); pointer-events: none; }
	pre { margin: 0; white-space: pre; overflow-wrap: normal; font-size: var(--type-code-size); line-height: var(--type-code-line); }
	.tok-comment { color: var(--syntax-comment); }
	.tok-keyword { color: var(--syntax-keyword); }
	.tok-string { color: var(--syntax-string); }
	.tok-number { color: var(--syntax-number); }

	.code .scroll-x { --bg: var(--surface-inverse); --shade: var(--scroll-shade-on-inverse); scrollbar-color: var(--edge-control-on-inverse) transparent; }
	.table-block { display: grid; gap: var(--space-2); }
	.cue-host { position: relative; min-inline-size: 0; }
	.table-actions { display: flex; flex-wrap: wrap; gap: var(--space-1); justify-self: start; max-inline-size: 100%; padding: var(--space-1); border-radius: var(--radius-bar-compact); background: var(--surface-glass-strong); -webkit-backdrop-filter: var(--glass-filter); backdrop-filter: var(--glass-filter); box-shadow: var(--elevation-card); }
	.t-act { display: inline-flex; align-items: center; gap: var(--space-2); min-block-size: max(var(--control-height-s), var(--target)); padding-inline: var(--space-3) var(--space-4); border: 0; border-radius: var(--radius-pill); background: transparent; font-size: var(--type-label-size); font-weight: var(--type-label-weight); }
	.t-act.danger { color: var(--danger); }
	.t-act:disabled { opacity: var(--disabled-opacity); color: var(--ink-secondary); cursor: default; }
	@media (hover: hover) {
		.t-act:not(:disabled):hover { background: var(--surface-tint); }
	}
	.table table { min-inline-size: 100%; font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); font-variant-numeric: var(--numeric-figures); }
	.table :is(th, td) { padding: var(--space-2) var(--space-3); box-shadow: var(--rule-below); text-align: start; white-space: nowrap; }
	.table th { font-weight: var(--weight-semibold); }

	.image { display: grid; gap: var(--space-1-5); }
	.plate { display: grid; place-items: center; aspect-ratio: 16 / 7; max-block-size: 18rem; inline-size: 100%; border-radius: var(--radius-panel); background: var(--surface-sunken); box-shadow: var(--ring-hairline); color: var(--ink-secondary); }
	figcaption input { inline-size: 100%; min-block-size: var(--target); padding: var(--space-1); border: 0; border-radius: var(--radius-text); background: transparent; text-align: center; font-size: var(--type-caption-size); color: var(--ink-secondary); }
	figcaption input::placeholder { color: var(--ink-muted); opacity: 1; }
	.file, .preview { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-3-5) var(--space-3) var(--space-3-5) var(--space-5); border-radius: var(--radius-panel); background: var(--surface-sunken); color: inherit; text-decoration: none; min-inline-size: 0; }
	.file { inline-size: fit-content; min-inline-size: min(18rem, 100%); max-inline-size: 100%; }
	.circle { display: grid; place-items: center; flex: none; inline-size: max(var(--control-height-s), var(--target)); block-size: max(var(--control-height-s), var(--target)); border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.card-text { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.over { font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; color: var(--ink-secondary); overflow-wrap: anywhere; }
	.name { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; }
	.desc { color: var(--ink-secondary); font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); }
	@media (hover: hover) {
		.file:hover, .preview:hover { background: var(--surface-tint); }
		.file:hover .circle, .preview:hover .circle { background: var(--surface-inverse-hover); }
	}
	hr { inline-size: 100%; border: 0; block-size: var(--stroke-hairline); margin-block: var(--space-2); background: var(--hairline); }
</style>
