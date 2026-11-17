<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockBlock } from '../../fixtures.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '../note/Icon.svelte';
	import State from '../note/State.svelte';
	import BlockMenu from './BlockMenu.svelte';
	import Blocks from './Blocks.svelte';
	import BubbleToolbar from './BubbleToolbar.svelte';
	import SlashMenu from './SlashMenu.svelte';
	import { COLOURS, EMOJI, LANGUAGES, pick, stressBlocks, wideTable } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const b = $derived(data.note.blocks);
	const stress = $derived(stressBlocks(data));
	const unknown = [
		{ type: 'columns', text: 'Two columns from a newer version of the editor, shown as plain text.' },
		{ type: 'embed', text: 'https://example.org/embedded-board' }
	] as unknown as MockBlock[];
</script>

<svelte:head><title>Editor · hi-fi</title></svelte:head>

<Frame>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Editor</li><li>Every surface</li></ul>
			<h1>Editor <em class="accent-word">surfaces</em></h1>
		</div>
	</header>
	<div class="screen-body editor-page">

		<div class="grid">
			<section class="card panel" aria-label="Slash menu">
				<State label="Slash menu — typed “/”" note="Listbox “Blocks”; arrows wrap; Enter or Tab inserts. On touch it sits above the soft keyboard.">
					<div class="doc"><p class="line">Three days, one backpack.</p><SlashMenu /></div>
				</State>
				<State label="Slash menu — filtered and empty">
					<div class="pair"><SlashMenu query="hea" /><SlashMenu query="zzz" emptyResult /></div>
				</State>
			</section>

			<section class="card panel" aria-label="Bubble toolbar">
				<State label="Bubble toolbar — format" note="Toolbar “Format” on a text selection; never over the native selection menu on touch.">
					<div class="doc"><p class="line">Three days, <mark>one backpack, no fixed plan</mark> beyond the first night.</p><BubbleToolbar /></div>
				</State>
				<State label="Bubble toolbar — link field and colours">
					<div class="doc"><BubbleToolbar mode="link" /><BubbleToolbar mode="colour" /></div>
				</State>
				<State label="Text colours" note="Stored by name, drawn from the content palette; each keeps 4.5:1 on the card and on a callout.">
					<p class="line colours">
						{#each COLOURS as name (name)}<span data-color={name}>{name}</span>{' '}{/each}
					</p>
				</State>
			</section>

			<section class="card panel" aria-label="Drag handle and block menu">
				<State label="Drag handle and drop line" note="Pointer: the handle sits in the gutter of the hovered block and is the drag source. Touch: it targets the cursor block, no drag.">
					<div class="doc">
						<div class="gutter"><Button variant="quiet" size="s" icon aria-label="Block actions"><Icon name="grip" /></Button><p class="line">Hover or cursor block with its handle.</p></div>
						<div class="gutter drop"><span class="gap"></span><p class="line">The drop line sits above this block while dragging.</p></div>
					</div>
				</State>
				<State label="Block menu — first block" note="Move up is disabled on the first block, Move down on the last.">
					<BlockMenu first />
				</State>
				<State label="Block menu — last block, Turn into open">
					<BlockMenu last turnInto />
				</State>
			</section>

			<section class="card panel" aria-label="Table actions">
				<State label="Table actions" note="Offered while the cursor is in a table; each action is disabled when not possible. A wide table scrolls inside itself.">
					<Blocks blocks={[wideTable(data.worst)]} tableActions />
				</State>
			</section>

			<section class="card panel" aria-label="Code language">
				<State label="Code language" note="“Language” picker: Plain text plus 21 languages; the stored language re-highlights.">
					<div class="pair">
						<Blocks blocks={[pick(b, 'code'), ...stress.filter((s) => s.type === 'code')]} />
						<ul class="menu langs" role="listbox" aria-label="Language">
							{#each LANGUAGES as lang (lang)}
								<li role="none"><button type="button" role="option" class="item" aria-selected={lang === 'JavaScript'}><span class="check"><Icon name="check" size={16} /></span>{lang}</button></li>
							{/each}
						</ul>
					</div>
				</State>
			</section>

			<section class="card panel" aria-label="Callout emoji">
				<State label="Callout emoji" note="“Change emoji” opens the emoji chooser; the default is 💡.">
					<div class="pair">
						<Blocks blocks={[pick(b, 'callout')]} />
						<div class="chooser menu">
							<label class="search"><span class="sr-only">Search emoji</span><input type="search" placeholder="Search emoji" /></label>
							<div class="emoji" role="listbox" aria-label="Emoji">
								{#each EMOJI as e, i (e)}<button type="button" role="option" aria-selected={i === 0}>{e}</button>{/each}
							</div>
						</div>
					</div>
				</State>
			</section>

			<section class="card panel" aria-label="Media">
				<State label="Image — caption, no caption, uploading" note="An empty caption leaves no visible caption.">
					<div class="stack">
						<Blocks blocks={[pick(b, 'image')]} />
						<Blocks blocks={[{ type: 'image', caption: '' }]} />
						<p class="uploading" role="status"><Icon name="clock" size={16} />Uploading</p>
					</div>
				</State>
				<State label="File card and link preview" note="Activating opens a new tab. A preview with nothing fetched shows domain and URL.">
					<div class="stack">
						<Blocks blocks={[pick(b, 'file'), pick(b, 'linkPreview')]} />
						<a class="bare" href="/__mockups/redesign/hifi/editor" data-hover><span class="bare-text"><span class="host">example.org</span><span class="url">https://example.org/a/path/that/could/not/be/fetched</span></span><span class="circle" aria-hidden="true"><Icon name="out" size={16} /></span></a>
					</div>
				</State>
			</section>

			<section class="card panel" aria-label="Structure">
				<State label="Toggle — closed and open" note="Open state is never saved: always closed on load.">
					<div class="stack">
						<Blocks blocks={[pick(b, 'toggle')]} />
						<Blocks blocks={[pick(b, 'toggle')]} openToggle />
					</div>
				</State>
				<State label="Unknown block types" note="A note saved by an older or newer schema: blocks the editor does not know show their text as paragraphs, no page error.">
					<Blocks blocks={unknown} />
				</State>
				<State label="Task list, quote, divider">
					<Blocks blocks={[pick(b, 'taskList'), pick(b, 'quote'), { type: 'divider' }]} />
				</State>
			</section>
		</div>

		<section class="card sheet" aria-labelledby="context-h">
			<div class="card-head"><h2 id="context-h">Every block in context</h2><span class="card-note">{data.worst ? 'Worst case' : 'Normal'}</span></div>
			<Blocks blocks={[...b, ...stress]} handleAt={1} />
		</section>
	</div>
</Frame>

<style>
	.editor-page { gap: var(--space-8); min-inline-size: 0; }
	.grid { display: grid; gap: var(--space-5); grid-template-columns: minmax(0, 1fr); align-items: start; }
	@media (min-width: 1000px) {
		.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}
	.panel { display: grid; gap: var(--space-7); padding: var(--space-6) var(--space-5); min-inline-size: 0; }
	.sheet { display: grid; gap: var(--space-5); padding: var(--space-7) var(--space-9) var(--space-10); background: var(--surface-raised); box-shadow: var(--shadow-lift); min-inline-size: 0; }
	@media (max-width: 1099px) {
		.sheet { padding: var(--space-6) var(--space-7) var(--space-8); }
	}
	@media (max-width: 767px) {
		.doc { padding: var(--space-2); }
		.sheet { padding: var(--space-5) var(--space-4) var(--space-6); border-radius: var(--radius-card-s); }
		.panel { padding: var(--space-5) var(--space-4); border-radius: var(--radius-card-s); }
	}
	@media (min-width: 1100px) {
		.sheet { margin-inline-start: var(--space-10); }
	}
	.doc { display: grid; gap: var(--space-3); justify-items: start; padding: var(--space-4); border-radius: var(--radius-panel); background: var(--surface-sunken); min-inline-size: 0; }
	.line { font-size: var(--type-body-size); line-height: var(--type-body-line); overflow-wrap: anywhere; }
	mark { background: var(--selection); color: var(--selection-ink); }
	.colours { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-4); }
	[data-color="stone"] { color: var(--text-stone); }
	[data-color="clay"] { color: var(--text-clay); }
	[data-color="ochre"] { color: var(--text-ochre); }
	[data-color="moss"] { color: var(--text-moss); }
	[data-color="sea"] { color: var(--text-sea); }
	[data-color="plum"] { color: var(--text-plum); }
	.pair { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: flex-start; }
	.pair > :global(*) { min-inline-size: 0; flex: 1 1 16rem; }
	.stack { display: grid; gap: var(--space-3); min-inline-size: 0; }
	.gutter { display: grid; grid-template-columns: max(var(--control-height-s), var(--target)) minmax(0, 1fr); align-items: start; gap: var(--space-1); inline-size: 100%; }
	.gutter.drop { position: relative; padding-block-start: var(--space-2); }
	.gutter.drop::before { content: ""; position: absolute; inset-inline: 0; inset-block-start: 0; block-size: var(--stroke-strong); border-radius: var(--radius-pill); background: var(--accent); }

	.menu { display: grid; gap: var(--space-0-5); padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); min-inline-size: 0; }
	.pair > .langs { max-block-size: 20rem; overflow-y: auto; flex: 0 1 12rem; }
	.item { display: flex; align-items: center; gap: var(--space-2-5); inline-size: 100%; min-block-size: max(var(--control-height-s), var(--target)); padding: 0 var(--space-3-5) 0 var(--space-3); border: 0; border-radius: var(--radius-item); background: transparent; text-align: start; font-size: var(--type-body-s-size); }
	.check { visibility: hidden; display: grid; }
	.item[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.item[aria-selected="true"] .check { visibility: visible; }
	.pair > .chooser { gap: var(--space-2); padding: var(--space-2); flex: 0 1 17rem; }
	.search input { inline-size: 100%; min-block-size: max(var(--control-height-s), var(--target)); padding-inline: var(--space-4); border: 0; border-radius: var(--radius-pill); background: var(--surface-sunken); box-shadow: var(--ring-control); font-size: var(--type-body-s-size); }
	.emoji { display: grid; grid-template-columns: repeat(auto-fill, minmax(max(var(--control-height-s), var(--target)), 1fr)); gap: var(--space-0-5); }
	.emoji button { min-block-size: max(var(--control-height-s), var(--target)); border: 0; border-radius: var(--radius-item); background: transparent; font-size: var(--type-title-size); }
	.emoji [aria-selected="true"] { background: var(--surface-selected); box-shadow: var(--ring-selected); }
	@media (hover: hover) {
		.item:not([aria-selected="true"]):hover, .emoji button:not([aria-selected="true"]):hover { background: var(--surface-sunken); }
	}
	.uploading { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--ink-secondary); }
	.bare { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: var(--space-3-5) var(--space-3) var(--space-3-5) var(--space-5); border-radius: var(--radius-panel); background: var(--surface-sunken); color: inherit; text-decoration: none; min-inline-size: 0; }
	.bare-text { display: grid; gap: var(--space-1); min-inline-size: 0; }
	.host { font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; color: var(--ink-secondary); }
	.circle { display: grid; place-items: center; flex: none; inline-size: max(var(--control-height-s), var(--target)); block-size: max(var(--control-height-s), var(--target)); border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.url { font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); overflow-wrap: anywhere; }
	@media (hover: hover) {
		.bare:hover { background: var(--surface-tint); }
	}
</style>
