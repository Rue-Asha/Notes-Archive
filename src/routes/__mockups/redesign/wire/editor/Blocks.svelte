<script lang="ts">
	import type { MockBlock } from '../../fixtures.ts';
	import Icon from '../note/Icon.svelte';

	type Props = { blocks: MockBlock[]; tableActions?: boolean; openToggle?: boolean };
	let { blocks, tableActions = false, openToggle = false }: Props = $props();

	const actions = ['Add row below', 'Add column right', 'Delete row', 'Delete column'];
	let toggles = $state<Record<number, boolean>>({});
</script>

<div class="body" role="group" aria-label="Note body">
	{#each blocks as block, i (i)}
		{#if block.type === 'heading'}
			{#if block.level === 1}<h2 class="h1">{block.text}</h2>
			{:else if block.level === 2}<h3 class="h2">{block.text}</h3>
			{:else}<h4 class="h3">{block.text}</h4>{/if}
		{:else if block.type === 'paragraph'}
			<p>{block.text}</p>
		{:else if block.type === 'bulletList'}
			<ul class="list">{#each block.items as item (item)}<li>{item}</li>{/each}</ul>
		{:else if block.type === 'orderedList'}
			<ol class="list">{#each block.items as item (item)}<li>{item}</li>{/each}</ol>
		{:else if block.type === 'taskList'}
			<ul class="tasks">
				{#each block.items as item (item.text)}
					<li><label><input type="checkbox" checked={item.done} /><span class:done={item.done}>{item.text}</span></label></li>
				{/each}
			</ul>
		{:else if block.type === 'quote'}
			<blockquote>{block.text}</blockquote>
		{:else if block.type === 'callout'}
			<div class="callout"><button type="button" class="emoji" aria-label="Change emoji">💡</button><p>{block.text}</p></div>
		{:else if block.type === 'toggle'}
			{@const open = toggles[i] ?? openToggle}
			<div class="toggle">
				<button type="button" class="toggle-head" aria-expanded={open} onclick={() => (toggles[i] = !open)}>
					<span class="turn" class:open><Icon name="caret" /></span><span>{block.summary}</span>
				</button>
				{#if open}<div class="toggle-body"><p>{block.text}</p></div>{/if}
			</div>
		{:else if block.type === 'code'}
			<div class="code">
				<div class="code-bar">
					<label class="lang"><span class="sr-only">Language</span>
						<select aria-label="Language"><option>JavaScript</option><option>Plain text</option></select>
					</label>
				</div>
				<pre><code>{block.text}</code></pre>
			</div>
		{:else if block.type === 'table'}
			<div class="table-wrap">
				{#if tableActions}
					<div class="table-actions" role="toolbar" aria-label="Table actions">
						{#each actions as action, n (action)}<button type="button" class="w-btn quiet" disabled={n === 2}>{action}</button>{/each}
					</div>
				{/if}
				<div class="scroll">
					<table>
						<tbody>
							{#each block.rows as row, r (r)}
								<tr>{#each row as cell, c (c)}{#if r === 0}<th scope="col">{cell}</th>{:else}<td>{cell}</td>{/if}{/each}</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else if block.type === 'image'}
			<figure class="image">
				<div class="plate" role="img" aria-label="Image placeholder"><Icon name="image" /></div>
				<figcaption><input type="text" aria-label="Caption" placeholder="Caption" value={block.caption} /></figcaption>
			</figure>
		{:else if block.type === 'file'}
			<a class="file" href="/__mockups/redesign/wire/editor" title={block.name}>
				<span class="file-icon"><Icon name="file" /></span>
				<span class="file-text"><span class="name">{block.name}</span><span class="sub">PDF · {block.size}</span></span>
			</a>
		{:else if block.type === 'linkPreview'}
			<a class="preview" href="/__mockups/redesign/wire/editor">
				<span class="plate" aria-hidden="true"><Icon name="link" /></span>
				<span class="preview-text"><span class="name">{block.title}</span><span class="sub">A line of the page description, cut after two lines when the page has a long one.</span><span class="host">{block.host}</span></span>
			</a>
		{:else}
			<hr />
		{/if}
	{/each}
</div>

<style>
	.body { display: grid; gap: var(--space-3); min-inline-size: 0; font-size: var(--type-body-size); line-height: var(--type-body-line); outline: none; }
	.body > * { min-inline-size: 0; overflow-wrap: anywhere; }
	.h1 { font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); margin-block-start: var(--space-3); }
	.h2 { font-family: var(--font-display); font-weight: var(--weight-display); font-size: calc(var(--type-display-s-size) * 0.8); line-height: var(--type-display-s-line); margin-block-start: var(--space-2); }
	.h3 { font-weight: var(--weight-semibold); font-size: var(--type-body-size); line-height: var(--type-body-line); margin-block-start: var(--space-1); }
	.list { padding-inline-start: var(--space-6); }
	ul.list { list-style: disc; }
	ol.list { list-style: decimal; }
	.tasks { display: grid; gap: var(--space-1); }
	.tasks label { display: flex; gap: var(--space-3); align-items: flex-start; }
	.tasks input { inline-size: var(--space-5); block-size: var(--space-5); margin: var(--space-0-5) 0 0; flex: none; }
	.done { color: var(--ink-muted); text-decoration: line-through; }
	blockquote { padding-inline-start: var(--space-4); border-inline-start: var(--stroke-rule) solid var(--ink-secondary); color: var(--ink-secondary); }
	.callout { display: flex; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-item); background: var(--surface-tint); }
	.emoji { flex: none; inline-size: var(--control-height-s); block-size: var(--control-height-s); border: 0; border-radius: var(--radius-round); background: transparent; font-size: var(--type-title-size); }
	.emoji:hover { background: var(--surface-tint); }
	.callout p { padding-block-start: var(--space-1-5); }
	.toggle-head { display: flex; align-items: center; gap: var(--space-1); min-block-size: var(--control-height-s); padding: 0 var(--space-2) 0 0; border: 0; background: transparent; text-align: start; font-weight: var(--weight-medium); }
	.turn { display: inline-grid; place-items: center; inline-size: var(--target); block-size: var(--target); color: var(--ink-secondary); }
	.turn.open :global(svg) { rotate: 90deg; }
	.toggle-body { padding-inline-start: var(--space-8); }
	.code { border-radius: var(--radius-item); background: var(--surface-sunken); min-inline-size: 0; }
	.code-bar { display: flex; justify-content: flex-end; padding: var(--space-1-5) var(--space-2) 0; }
	.lang select { min-block-size: var(--control-height-xs); padding-inline: var(--space-3); border: 0; border-radius: var(--radius-pill); background: var(--surface-tint); font-size: var(--type-caption-size); }
	pre { margin: 0; padding: var(--space-2) var(--space-4) var(--space-4); overflow-x: auto; white-space: pre; font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); }
	.table-wrap { display: grid; gap: var(--space-1-5); }
	.table-actions { display: flex; flex-wrap: wrap; gap: var(--space-1); padding: var(--space-1); border-radius: var(--radius-item); background: var(--surface-raised); box-shadow: var(--ring-hairline); inline-size: fit-content; max-inline-size: 100%; }
	.table-actions .w-btn { min-block-size: var(--control-height-xs); padding-inline: var(--space-3); font-size: var(--type-caption-size); }
	.scroll { overflow-x: auto; max-inline-size: 100%; border-radius: var(--radius-text); box-shadow: var(--ring-hairline); }
	table { inline-size: 100%; min-inline-size: max-content; font-size: var(--type-body-s-size); }
	th, td { padding: var(--space-2) var(--space-3); text-align: start; vertical-align: top; border: var(--stroke-hairline) solid var(--hairline); overflow-wrap: normal; }
	th { background: var(--surface-tint); font-weight: var(--weight-semibold); }
	.image { display: grid; gap: var(--space-1-5); }
	.plate { display: grid; place-items: center; aspect-ratio: 16 / 7; max-block-size: 18rem; inline-size: 100%; border-radius: var(--radius-item); background: var(--surface-sunken); color: var(--ink-muted); box-shadow: var(--ring-hairline); }
	figcaption input { inline-size: 100%; border: 0; background: transparent; text-align: center; font-size: var(--type-caption-size); color: var(--ink-secondary); padding: var(--space-1); }
	.file, .preview { display: flex; gap: var(--space-3); align-items: center; padding: var(--space-3) var(--space-4); border-radius: var(--radius-item); box-shadow: var(--ring-hairline); text-decoration: none; min-inline-size: 0; }
	.file { inline-size: fit-content; max-inline-size: 100%; }
	.preview { align-items: stretch; }
	.preview .plate { inline-size: var(--space-16); aspect-ratio: auto; min-block-size: var(--space-14); flex: none; border-radius: var(--radius-text); }
	.file-icon { display: grid; place-items: center; inline-size: var(--space-10); block-size: var(--space-10); border-radius: var(--radius-text); background: var(--surface-tint); flex: none; }
	.file-text, .preview-text { display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.name { font-weight: var(--weight-semibold); font-size: var(--type-title-size); overflow-wrap: anywhere; }
	.sub, .host { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); overflow-wrap: anywhere; }
	hr { inline-size: 100%; border: 0; block-size: var(--stroke-hairline); background: var(--hairline); margin-block: var(--space-3); }
</style>
