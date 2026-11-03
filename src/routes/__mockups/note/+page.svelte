<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import MockShell from '#lib/mockups/MockShell.svelte';
	import { photo } from '#lib/mockups/fixtures.ts';

	const slash = [
		['H1', 'Heading 1', 'Big section heading'],
		['H2', 'Heading 2', 'Medium section heading'],
		['•', 'Bulleted list', 'A simple list'],
		['✓', 'To-do list', 'Track tasks with checkboxes'],
		['›', 'Toggle', 'Hide detail inside'],
		['“', 'Quote', 'Set a line apart'],
		['</>', 'Code block', 'With syntax highlighting']
	];
</script>

<svelte:head><title>Note · Notes Archive mockups</title></svelte:head>

<div data-screen="note">
	<MockShell active="tree">
		<article class="page">
			<div class="topbar">
				<nav class="crumbs" aria-label="Breadcrumb">
					<a href="#home">Home</a><Icon name="chevron" size={14} /><a href="#folder">Architecture</a><Icon name="chevron" size={14} /><span>Houses</span>
				</nav>
				<div class="tools"><span class="saved">Saved</span><IconButton icon="pin" label="Pin" /><IconButton icon="more" label="Note menu" /></div>
			</div>

			<div class="column" data-note-column>
				<header>
					<button class="emoji" type="button" aria-label="Change icon">🏡</button>
					<h1 data-note-title>Courtyard house, first sketches</h1>
					<div class="props" data-properties>
						<span class="prop glass"><Icon name="folder" size={16} />Houses</span>
						<span class="prop glass"><Icon name="tag" size={16} />architecture</span>
						<span class="prop glass"><Icon name="tag" size={16} />ideas</span>
						<span class="prop add"><Icon name="plus" size={16} />Add tag</span>
						<span class="prop glass"><Icon name="pin" size={16} />Pinned</span>
					</div>
					<p class="edited tnum">Edited 2 Nov 2026, 14:20 · Created 12 Sep 2026</p>
				</header>

				<div class="prose">
					<p class="bubble-anchor">
						<span class="sel">A low volume around a walled garden</span>, stone to the street and glass to the inside. The <strong>roof edge</strong> stays
						thin, the <em>floor plan</em> stays <code>quiet</code> and the <a href="#plans">neighbour's plan</a> is
						<span data-color="clay">still missing</span>.
						<span class="bubble glass" data-bubble-menu role="toolbar" aria-label="Formatting">
							<button type="button" class="turn">Text<Icon name="chevron" size={14} /></button>
							<span class="rule"></span>
							<button type="button" aria-label="Bold"><Icon name="bold" size={17} /></button>
							<button type="button" aria-label="Italic"><Icon name="italic" size={17} /></button>
							<button type="button" aria-label="Strikethrough"><Icon name="strike" size={17} /></button>
							<button type="button" aria-label="Code"><Icon name="code" size={17} /></button>
							<button type="button" aria-label="Link"><Icon name="link" size={17} /></button>
							<button type="button" aria-label="Text colour"><Icon name="palette" size={17} /></button>
						</span>
					</p>

					<h1>Site and brief</h1>
					<h2>Rooms</h2>
					<ul>
						<li>Living room facing south, opening to the court</li>
						<li>Kitchen with an east window for the morning
							<ul><li>Pantry behind the wall, no door</li></ul>
						</li>
						<li>Studio on the north side, the quietest light</li>
					</ul>
					<ol>
						<li>Fix the plot boundary with the surveyor</li>
						<li>Redraw the section through the court</li>
						<li>Ask for two quotes on the stone</li>
					</ol>

					<h3>Next steps</h3>
					<ul data-type="taskList">
						<li data-checked="true"><label><input type="checkbox" checked tabindex="-1" /></label><div><p>Collect the first reference photographs</p></div></li>
						<li data-checked="false"><label><input type="checkbox" tabindex="-1" /></label><div><p>Send the plans to Lena on Monday</p></div></li>
						<li data-checked="false"><label><input type="checkbox" tabindex="-1" /></label><div><p>Decide on the roof edge before the budget</p></div></li>
					</ul>

					<blockquote><p>A house should be a good place to be at seven in the morning on an ordinary Tuesday.</p></blockquote>

					<div class="callout"><button class="callout-emoji" type="button" aria-label="Change emoji">💡</button><div><p>Keep the roof edge at 180 mm. Everything else can move, this cannot.</p></div></div>

					<div data-type="details" class="is-open">
						<button type="button" aria-label="Toggle"></button>
						<div>
							<div data-type="detailsSummary"><p>Budget assumptions</p></div>
							<div data-type="detailsContent"><p>Stone at 310 per square metre, timber doors at 1,900 each, a contingency of ten percent.</p></div>
						</div>
					</div>

					<pre><span class="code-language">ts</span><code><span class="hljs-keyword">const</span> wall = {'{'}
  <span class="hljs-attr">material</span>: <span class="hljs-string">'travertine'</span>,
  <span class="hljs-attr">thickness</span>: <span class="hljs-number">0.42</span>, <span class="hljs-comment">// metres</span>
{'}'};</code></pre>

					<div class="table-scroll">
						<table>
							<tbody>
								<tr><th><p>Room</p></th><th><p>Area</p></th><th><p>Light</p></th></tr>
								<tr><td><p>Living room</p></td><td><p>38 m²</p></td><td><p>South</p></td></tr>
								<tr><td><p>Kitchen</p></td><td><p>14 m²</p></td><td><p>East</p></td></tr>
								<tr><td><p>Studio</p></td><td><p>18 m²</p></td><td><p>North</p></td></tr>
							</tbody>
						</table>
					</div>

					<hr />

					<figure class="image-block">
						<img src={photo('house-midcentury')} alt="A long low house behind pines" />
						<figcaption>The reference: low, long, quiet against the trees.</figcaption>
					</figure>

					<a class="file-card" href="#file">
						<span class="file-icon"><Icon name="file" size={22} /></span>
						<span class="file-text"><strong>Floor plan v3.pdf</strong><small class="tnum">2.4 MB</small></span>
						<Icon name="arrow-right" size={18} />
					</a>

					<a class="link-card" href="#link">
						<img src={photo('interior-rio')} alt="" />
						<div><strong>Light in the courtyard house</strong><p>How a walled garden changes the way a room is lit through the day.</p><small>example.org</small></div>
					</a>

					<div class="slash-anchor">/<span class="caret"></span>
						<GlassPanel as="div" strong class="slash" data-slash-menu role="listbox" aria-label="Blocks">
							<p class="eyebrow">Basic blocks</p>
							{#each slash as [glyph, name, hint], i (name)}
								<div class="opt" class:selected={i === 0} role="option" aria-selected={i === 0}>
									<span class="glyph">{glyph}</span>
									<span class="txt"><strong>{name}</strong><small>{hint}</small></span>
								</div>
							{/each}
						</GlassPanel>
					</div>
				</div>
			</div>
		</article>
	</MockShell>
</div>

<style>
	.page {
		display: grid;
		gap: var(--s-6);
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
	}

	.crumbs {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.crumbs span {
		color: var(--ink);
		font-weight: 600;
	}

	.tools {
		display: flex;
		align-items: center;
		gap: var(--s-2);
	}

	.saved {
		margin-inline-end: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.column {
		inline-size: 100%;
		max-inline-size: var(--note-col);
		margin-inline: auto;
		padding-block-end: 520px;
	}

	header {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
		margin-block-end: var(--s-10);
	}

	.emoji {
		padding: 0;
		border: 0;
		background: transparent;
		font-size: 64px;
		line-height: 1;
	}

	header h1 {
		font-size: var(--t-note-title);
		letter-spacing: var(--tracking-display);
		line-height: 1.04;
	}

	.props {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.prop {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-3);
		border-radius: var(--r-pill);
		font-size: var(--t-small);
		font-weight: 500;
	}

	.prop.add {
		border: 1px dashed color-mix(in srgb, var(--ink) 25%, transparent);
		background: none;
		box-shadow: none;
		color: var(--ink-2);
	}

	.edited {
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.bubble-anchor {
		position: relative;
	}

	.sel {
		background: color-mix(in srgb, var(--accent) 24%, transparent);
		border-radius: 3px;
	}

	.bubble {
		position: absolute;
		inset-block-end: calc(100% + var(--s-3));
		inset-inline-start: 0;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: var(--s-1) var(--s-2);
		border-radius: var(--r-pill);
		background-color: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
		box-shadow: var(--glass-rim), var(--shadow-float);
		font-size: var(--t-small);
		line-height: 1;
	}

	.bubble button {
		display: inline-grid;
		place-items: center;
		min-inline-size: 34px;
		block-size: 34px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink);
	}

	.bubble .turn {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		padding-inline: var(--s-3);
		font-weight: 600;
	}

	.bubble button:hover {
		background: var(--row-hover);
	}

	.rule {
		inline-size: 1px;
		block-size: 18px;
		margin-inline: var(--s-1);
		background: var(--line);
	}

	:global(.prose .file-card) {
		justify-content: space-between;
	}

	.file-icon {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-md);
		background: var(--accent-soft);
	}

	.file-text {
		display: grid;
		flex: 1;
	}

	.file-text small,
	.link-card small {
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.link-card div {
		display: grid;
		gap: var(--s-1);
	}

	.link-card p {
		color: var(--ink-2);
		font-size: var(--t-body);
		line-height: 1.4;
	}

	.slash-anchor {
		position: relative;
	}

	.caret {
		display: inline-block;
		inline-size: 2px;
		block-size: 1.1em;
		margin-inline-start: 1px;
		vertical-align: text-bottom;
		background: var(--accent);
	}

	:global(.prose .slash) {
		position: absolute;
		z-index: 5;
		inset-block-start: calc(100% + var(--s-2));
		inset-inline-start: 0;
		display: grid;
		gap: 2px;
		inline-size: min(300px, 100%);
		padding: var(--s-2);
		border-radius: var(--r-xl);
		box-shadow: var(--glass-rim), var(--shadow-float);
		font-size: var(--t-body);
		line-height: 1.3;
	}

	:global(.prose .slash .eyebrow) {
		padding: var(--s-2) var(--s-3);
	}

	.opt {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		padding: var(--s-2) var(--s-3);
		border-radius: var(--r-lg);
	}

	.opt.selected {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
	}

	.glyph {
		display: grid;
		place-items: center;
		inline-size: 36px;
		block-size: 36px;
		border: 1px solid var(--line);
		border-radius: var(--r-md);
		background: var(--surface);
		font-size: var(--t-small);
		font-weight: 600;
	}

	.txt {
		display: grid;
	}

	.txt small {
		color: var(--ink-2);
		font-size: 12px;
	}
</style>
