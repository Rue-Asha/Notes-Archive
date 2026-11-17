<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Icon from '../note/Icon.svelte';
	import Specimen from '../note/Specimen.svelte';
	import '../note/wire.css';
	import Blocks from './Blocks.svelte';
	import BlockMenu from './BlockMenu.svelte';
	import BubbleToolbar from './BubbleToolbar.svelte';
	import SlashMenu from './SlashMenu.svelte';
	import { EMOJI, LANGUAGES, pick, stressBlocks, wideTable } from './data.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const b = $derived(data.note.blocks);
	const stress = $derived(stressBlocks(data));
</script>

<svelte:head><title>Editor · wireframe</title></svelte:head>

<Frame>
	<div class="w-page">
		<header class="w-head">
			<p class="w-kicker">Gate 4 · editor surfaces</p>
			<h1>Editor</h1>
		</header>

		<div class="grid">
			<Specimen label="Slash menu — typed “/”" note="Listbox “Blocks”; arrows wrap; Enter or Tab inserts. On touch it sits above the soft keyboard.">
				<div class="doc"><p class="line">Three days, one backpack.</p><SlashMenu /></div>
			</Specimen>
			<Specimen label="Slash menu — filtered and empty">
				<div class="pair">
					<SlashMenu query="hea" />
					<SlashMenu query="zzz" emptyResult />
				</div>
			</Specimen>

			<Specimen label="Bubble toolbar — format" note="Toolbar “Format” on a text selection; never over the native selection menu on touch.">
				<div class="doc"><p class="line">Three days, <span class="sel">one backpack, no fixed plan</span> beyond the first night.</p><BubbleToolbar /></div>
			</Specimen>
			<Specimen label="Bubble toolbar — link field and colours">
				<div class="doc"><BubbleToolbar mode="link" /><BubbleToolbar mode="colour" /></div>
			</Specimen>

			<Specimen label="Drag handle and block menu" note="Pointer: handle in the gutter of the hovered block, also the drag source. Touch: targets the cursor block, no drag.">
				<div class="doc">
					<div class="gutter"><button type="button" class="w-icon grip" aria-label="Block actions"><Icon name="grip" /></button><p class="line">Hover or cursor block with its handle.</p></div>
					<div class="gutter drop"><span class="grip-gap"></span><p class="line">Drop position line sits above this block while dragging.</p></div>
				</div>
			</Specimen>
			<Specimen label="Block menu — first block" note="Move up disabled on the first block, Move down on the last.">
				<BlockMenu first />
			</Specimen>
			<Specimen label="Block menu — last block, Turn into open">
				<BlockMenu last turnInto />
			</Specimen>

			<Specimen label="Table actions" note="Offered while the cursor is in a table; each action disabled when not possible. The wide table scrolls inside itself.">
				<Blocks blocks={[wideTable(data.worst)]} tableActions />
			</Specimen>

			<Specimen label="Code language" note="“Language” picker: Plain text plus 21 languages; the stored language re-highlights.">
				<div class="pair">
					<Blocks blocks={[pick(b, 'code'), ...stress.filter((s) => s.type === 'code')]} />
					<ul class="w-menu langs" role="listbox" aria-label="Language">
						{#each LANGUAGES as lang (lang)}<li role="none"><button type="button" role="option" aria-selected={lang === 'JavaScript'}>{lang}</button></li>{/each}
					</ul>
				</div>
			</Specimen>

			<Specimen label="Callout emoji" note="“Change emoji” opens the emoji chooser; default 💡.">
				<div class="pair">
					<Blocks blocks={[pick(b, 'callout')]} />
					<div class="chooser w-menu">
						<label class="search"><span class="sr-only">Search emoji</span><input type="search" placeholder="Search emoji" /></label>
						<div class="emoji" role="listbox" aria-label="Emoji">
							{#each EMOJI as e, i (e)}<button type="button" role="option" aria-selected={i === 0}>{e}</button>{/each}
						</div>
					</div>
				</div>
			</Specimen>

			<Specimen label="Image — caption, no caption, uploading" note="An empty caption leaves no visible caption.">
				<div class="stack">
					<Blocks blocks={[pick(b, 'image')]} />
					<Blocks blocks={[{ type: 'image', caption: '' }]} />
					<p class="uploading" role="status"><span class="spin" aria-hidden="true"></span>Uploading</p>
				</div>
			</Specimen>

			<Specimen label="File card and link preview" note="Activating opens a new tab. A preview with nothing fetched shows domain and URL.">
				<div class="stack">
					<Blocks blocks={[pick(b, 'file'), pick(b, 'linkPreview')]} />
					<a class="bare" href="/__mockups/redesign/wire/editor"><span class="host">example.org</span><span class="url">https://example.org/a/path/that/could/not/be/fetched</span></a>
				</div>
			</Specimen>

			<Specimen label="Toggle — closed and open" note="Open state is never saved: always closed on load.">
				<div class="stack">
					<Blocks blocks={[pick(b, 'toggle')]} />
					<Blocks blocks={[pick(b, 'toggle')]} openToggle />
				</div>
			</Specimen>

			<Specimen label="Task list, quote, divider">
				<Blocks blocks={[pick(b, 'taskList'), pick(b, 'quote'), { type: 'divider' }]} />
			</Specimen>
		</div>

		<section class="w-card" aria-label="Whole body">
			<div class="w-card-head"><h2>Every block in context</h2><span class="w-note">{data.worst ? 'Worst case' : 'Normal'}</span></div>
			<Blocks blocks={[...b, ...stress]} />
		</section>
	</div>
</Frame>

<style>
	.grid { display: grid; gap: var(--space-8) var(--space-6); grid-template-columns: minmax(0, 1fr); align-items: start; }
	@media (min-width: 1000px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	.doc { display: grid; gap: var(--space-2); justify-items: start; padding: var(--space-4); border-radius: var(--radius-item); background: var(--surface-card); box-shadow: var(--ring-hairline); min-inline-size: 0; }
	.line { font-size: var(--type-body-size); line-height: var(--type-body-line); overflow-wrap: anywhere; }
	.sel { background: var(--surface-tint-strong); }
	.pair { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: flex-start; }
	.pair > :global(*) { min-inline-size: 0; flex: 1 1 16rem; }
	.stack { display: grid; gap: var(--space-3); min-inline-size: 0; }
	.gutter { display: grid; grid-template-columns: var(--control-height-s) minmax(0, 1fr); align-items: start; gap: var(--space-1); inline-size: 100%; }
	.gutter.drop { border-block-start: var(--stroke-strong) solid var(--ink); padding-block-start: var(--space-1); }
	.grip { background: var(--surface-tint); }
	.pair > .langs { max-block-size: 20rem; overflow-y: auto; flex: 0 1 12rem; }
	.langs [aria-selected="true"] { background: var(--surface-tint-strong); }
	.pair > .chooser { gap: var(--space-2); padding: var(--space-2); flex: 0 1 16rem; }
	.search input { inline-size: 100%; min-block-size: var(--control-height-s); padding-inline: var(--space-3); border: 0; border-radius: var(--radius-pill); background: var(--surface-tint); }
	.emoji { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--space-0-5); }
	.emoji button { min-block-size: var(--control-height-s); border: 0; border-radius: var(--radius-text); background: transparent; font-size: var(--type-title-size); }
	.emoji [aria-selected="true"] { background: var(--surface-tint-strong); }
	.uploading { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--ink-secondary); }
	.spin { inline-size: var(--space-3-5); block-size: var(--space-3-5); border-radius: var(--radius-round); border: var(--stroke-rule) solid var(--ink-muted); }
	.bare { display: grid; gap: var(--space-0-5); padding: var(--space-3) var(--space-4); border-radius: var(--radius-item); box-shadow: var(--ring-hairline); text-decoration: none; min-inline-size: 0; }
	.host { font-weight: var(--weight-semibold); }
	.url { font-size: var(--type-caption-size); color: var(--ink-muted); overflow-wrap: anywhere; }
</style>
