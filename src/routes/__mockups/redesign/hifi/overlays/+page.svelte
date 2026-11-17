<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockFolder } from '../../fixtures.ts';
	import Icon, { type IconName } from '../search/Icon.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Dialog from './Dialog.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import Specimen from './Specimen.svelte';
	import NoMatch from '../ui/NoMatch.svelte';
	import Toast from '../ui/Toast.svelte';
	import { sortLabels } from '../ui/sort.ts';
	import { cueY } from '#lib/components/scroll-cue/cue.ts';

	const data = $derived(mockData(new URL(page.url.href)));
	const folderName = $derived(data.folder.name);

	type Flat = { id: number; name: string; depth: number };
	function flatten(folders: MockFolder[], depth = 1, skip: number | null = null, out: Flat[] = []): Flat[] {
		for (const f of folders) {
			if (f.id === skip) continue;
			out.push({ id: f.id, name: f.name, depth });
			flatten(f.children, depth + 1, skip, out);
		}
		return out;
	}
	const all = $derived(flatten(data.tree));
	const withoutTravel = $derived(flatten(data.tree, 1, data.worst ? data.tree[0].id : 1));
	const currentId = $derived(data.worst ? all[3].id : 11);

	const emoji = [
		['📝', 'Memo'], ['📚', 'Books'], ['🌿', 'Herb'], ['🚆', 'Train'], ['🧳', 'Luggage'], ['📌', 'Pushpin'],
		['🍳', 'Cooking'], ['🎓', 'Graduation cap'], ['💡', 'Light bulb'], ['🗂️', 'Card index dividers'], ['🏠', 'House'], ['✈️', 'Airplane'],
		['🔧', 'Wrench'], ['📅', 'Calendar'], ['🎧', 'Headphone'], ['🌍', 'Globe']
	];

	type Item = MenuItem & { icon?: IconName; focus?: boolean };
	const noteMenu: Item[] = [
		{ label: 'Search', kbd: 'Ctrl K', icon: 'search', focus: true },
		{ label: 'Unpin', icon: 'pin' },
		{ label: 'Move to…', icon: 'folder' },
		{ label: 'Delete', danger: true, separator: true, icon: 'trash' }
	];
	const entryMenu: Item[] = [{ label: 'Pin', icon: 'pin' }, { label: 'Move to…', icon: 'folder' }, { label: 'Delete', danger: true, separator: true, icon: 'trash' }];
	const pinnedMenu: Item[] = [
		{ label: 'Move up', disabled: true, icon: 'arrowUp' },
		{ label: 'Move down', icon: 'arrowDown' },
		{ label: 'Unpin', icon: 'pin', separator: true },
		{ label: 'Move to…', icon: 'folder' },
		{ label: 'Delete', danger: true, separator: true, icon: 'trash' }
	];
	const folderMenu: Item[] = [
		{ label: 'New note', icon: 'plus' },
		{ label: 'New folder', icon: 'folderPlus' },
		{ label: 'Rename', separator: true },
		{ label: 'Move to…', icon: 'folder' },
		{ label: 'Delete', danger: true, separator: true, icon: 'trash' }
	];
	const noCover: Item[] = [{ label: 'Add cover', icon: 'image' }];
	const hasCover: Item[] = [{ label: 'Change cover', icon: 'image' }, { label: 'Remove cover', danger: true, icon: 'trash' }];
	const sortMenu: Item[] = [
		{ label: sortLabels.mixed, checked: true, focus: true },
		{ label: sortLabels.name },
		{ label: sortLabels.edited },
		{ label: sortLabels.created }
	];
	const checking: Item[] = [{ label: 'Delete', disabled: true, hint: 'Checking…' }];

	const noteTitle = $derived(data.note.title || 'Untitled');
	const pickerMiss = $derived(data.worst ? data.search.query.slice(0, 40) : 'zzz');
</script>

<svelte:head><title>Overlays · Notes Archive</title></svelte:head>

{#snippet menu(name: string, items: Item[], radio = false)}
	<div class="menu-host" data-focus-first={items.some((i) => i.focus) || undefined}>
		<Menu {name} {items} {radio}>
			{#snippet icon(item)}{#if (item as Item).icon}<Icon name={(item as Item).icon!} size={16} />{/if}{/snippet}
		</Menu>
	</div>
{/snippet}

{#snippet cancel(focus = false)}<Button data-show-focus={focus || undefined}>Cancel</Button>{/snippet}

<Frame current={null}>
	<header class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Notes</li><li>Overlays</li></ul>
			<h1>Dialogs, menus and <em class="accent-word">toasts</em></h1>
			<p class="lede">Everything is drawn open. Modal dialogs: focus moves in and is trapped, Esc and a click outside cancel, focus returns to the opener. Menus: arrows, Home and End move; Esc closes and returns focus. On phones a dialog is a bottom sheet. The ringed control in each specimen is the one that has focus.</p>
		</div>
	</header>
	<div class="screen-body">

	<section class="card panel" aria-labelledby="g-del">
		<h2 id="g-del">Delete confirm</h2>
		<div class="grid">
			<Specimen label="Note" note="From the note menu or a note entry menu. Cancel has focus." sheet>
				<Dialog id="d-note" alert title={`Delete “${noteTitle}”?`} body="This can't be undone.">
					{#snippet actions()}{@render cancel(true)}<Button variant="danger"><Icon name="trash" size={16} />Delete note</Button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Note without a title" sheet>
				<Dialog id="d-untitled" alert title="Delete “Untitled”?" body="This can't be undone.">
					{#snippet actions()}{@render cancel(true)}<Button variant="danger"><Icon name="trash" size={16} />Delete note</Button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · before the counts load" note="No dialog yet. The menu item shows it is busy; the dialog opens once counts are known.">
				{@render menu(`${folderName} actions`, checking)}
			</Specimen>
			<Specimen label="Folder · counts known" sheet>
				<Dialog id="d-folder" alert title={`Delete “${folderName}”?`} body="This deletes 3 folders and 12 notes inside it. This can't be undone.">
					{#snippet actions()}{@render cancel(true)}<Button variant="danger"><Icon name="trash" size={16} />Delete folder</Button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · singular counts" sheet>
				<Dialog id="d-one" alert title="Delete “Lisbon”?" body="This deletes 1 folder and 1 note inside it. This can't be undone.">
					{#snippet actions()}{@render cancel(true)}<Button variant="danger"><Icon name="trash" size={16} />Delete folder</Button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · empty" sheet>
				<Dialog id="d-empty" alert title="Delete “Empty one”?" body="This can't be undone.">
					{#snippet actions()}{@render cancel(true)}<Button variant="danger"><Icon name="trash" size={16} />Delete folder</Button>{/snippet}
				</Dialog>
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-move">
		<h2 id="g-move">Move to chooser</h2>
		<div class="grid">
			{#each [{ label: 'Moving a note: Root, then every folder in tree order', list: all }, { label: 'Moving a folder: itself and its descendants are left out', list: withoutTravel }] as c, n (c.label)}
				<Specimen label={c.label} note="The current location is marked. Picking applies at once." sheet>
					<Dialog id="d-move-{n}" title="Move to" kicker="Choose a folder" wide>
						<ul class="choose hf-scroll-y" role="listbox" aria-label="Choose a folder" use:cueY>
							<li class="opt" class:sel={n === 1} class:focus={n === 0} role="option" aria-selected={n === 1}>
								<span class="tick" aria-hidden="true"><Icon name="check" size={14} /></span><span class="name">Root</span>{#if n === 1}<span class="cur">Current</span>{/if}
							</li>
							{#each c.list as f (f.id)}
								{@const here = n === 0 && f.id === currentId}
								<li class="opt" class:sel={here} role="option" aria-selected={here} style:--depth={Math.min(f.depth - 1, 5)}>
									<span class="tick" aria-hidden="true"><Icon name="check" size={14} /></span>
									<span class="name" title={f.name} lang="de">{f.name}</span>
									{#if f.depth > 6}<span class="level">Level {f.depth}</span>{/if}
									{#if here}<span class="cur">Current</span>{/if}
								</li>
							{/each}
						</ul>
						{#snippet actions()}{@render cancel()}{/snippet}
					</Dialog>
				</Specimen>
			{/each}
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-icon">
		<h2 id="g-icon">Icon picker</h2>
		<div class="grid">
			<Specimen label="Results" note="Search filters by keyword. Arrows move through the emoji." sheet>
				<Dialog id="d-icon" title="Icon" wide>
					<div class="picker">
						<label class="field">
							<span class="sr">Search emoji</span>
							<span class="control"><span class="affix" aria-hidden="true"><Icon name="search" /></span><input type="search" placeholder="Search emoji" /></span>
						</label>
						<ul class="emoji" role="listbox" aria-label="Emoji">
							{#each emoji as [e, name], i (name)}
								<li role="option" aria-selected={i === 1} aria-label={name} class:focus={i === 0} class:sel={i === 1}>{e}{#if i === 1}<span class="badge" aria-hidden="true"><Icon name="check" size={12} /></span>{/if}</li>
							{/each}
						</ul>
					</div>
					{#snippet actions()}<Button>Remove icon</Button>{@render cancel()}{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="No match" sheet>
				<Dialog id="d-icon-none" title="Icon" wide>
					<div class="picker">
						<label class="field">
							<span class="sr">Search emoji</span>
							<span class="control"><span class="affix" aria-hidden="true"><Icon name="search" /></span><input type="search" value={pickerMiss} /></span>
						</label>
						<div class="none"><NoMatch lead="No emoji match" query={pickerMiss} /></div>
					</div>
					{#snippet actions()}<Button>Remove icon</Button>{@render cancel()}{/snippet}
				</Dialog>
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-menus">
		<h2 id="g-menus">Menus</h2>
		<div class="grid">
			<Specimen label="Cover menu · no cover" note="On the folder page, from the cover control.">
				{@render menu('Cover', noCover)}
			</Specimen>
			<Specimen label="Cover menu · with a cover">
				{@render menu('Cover', hasCover)}
			</Specimen>
			<Specimen label="Note menu" note="Search stays reachable on touch while the editor has focus. Search has focus.">
				{@render menu('Note menu', noteMenu)}
			</Specimen>
			<Specimen label="Note actions · list entry">
				{@render menu('Note actions', entryMenu)}
			</Specimen>
			<Specimen label="Note actions · pinned entry" note="Move up is disabled at the top, Move down at the bottom.">
				{@render menu('Note actions', pinnedMenu)}
			</Specimen>
			<Specimen label="Folder menu" note="Named “{folderName} actions”.">
				{@render menu(`${folderName} actions`, folderMenu)}
			</Specimen>
			<Specimen label="Sort menu" note="Quiet icon button in the tree header; on the phone on Folders. The checked item is charcoal with a check.">
				{@render menu('Sort', sortMenu, true)}
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-toast">
		<h2 id="g-toast">Toasts</h2>
		<p class="card-note">Info toasts leave after 5 s (8 s with an action), errors stay until dismissed; announced politely, errors as alerts. One visible per region; older ones peek behind it. A toast raised before a redirect survives to the next page.</p>
		<div class="grid">
			<Specimen label="Info, with an action">
				<div class="toasts" role="status" aria-live="polite">
					<Toast message="Moved “Berlin trip” to Travel" action="Undo" focus="action" />
				</div>
			</Specimen>
			<Specimen label="Error" note="Stays until dismissed.">
				<div class="toasts" role="alert">
					<Toast kind="error" message="Couldn't save — try again" action="Retry" />
				</div>
			</Specimen>
			<Specimen label="Cover or image over 16 MB" note="Folder cover and the editor's image path raise the same toast.">
				<div class="toasts" role="alert">
					<Toast kind="error" message="That image is too large" />
				</div>
			</Specimen>
			<Specimen label="Sort save fails" note="The tree's sort menu: the picked mode goes back to the saved one and this toast says why.">
				<div class="toasts" role="alert">
					<Toast kind="error" message="Couldn’t save — try again" action="Retry" />
				</div>
			</Specimen>
			<Specimen label="Three in a row: the newest in front" note="Older ones peek at a smaller scale.">
				<div class="toasts">
					<Toast back={2} message="Files can be up to 16 MB" />
					<Toast back={1} message="That file isn't an image" />
					<Toast message="Pinned order changed elsewhere — reloaded" />
				</div>
			</Specimen>
			<Specimen label="Long message">
				<div class="toasts" role="alert">
					<Toast kind="error" message={data.worst ? `Couldn't upload “${data.note.title.slice(0, 48).trimEnd()}…” — try again` : "Couldn't upload — try again"} action="Retry" />
				</div>
			</Specimen>
		</div>
	</section>
	</div>
</Frame>

<style>
	.menu-host {
		display: contents;
	}
	.menu-host[data-focus-first] :global(.item:first-of-type) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}
	:global([data-show-focus]) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.menu-host[data-focus-first] :global(.item[aria-checked='true']:first-of-type) {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5);
		align-items: start;
	}
	.choose {
		display: grid;
		grid-auto-rows: max-content;
		align-content: start;
		gap: var(--space-0-5);
		max-block-size: 18rem;
		padding: var(--space-1) var(--space-1) var(--space-6);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.opt {
		display: grid;
		grid-template-columns: var(--space-6) minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-block: var(--space-1);
		padding-inline-end: var(--space-3);
		padding-inline-start: calc(var(--space-2) + var(--depth, 0) * var(--space-3));
		border-radius: var(--radius-panel);
	}
	.tick {
		display: grid;
		place-items: center;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: transparent;
	}
	.opt.sel {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.opt.sel .tick {
		background: var(--surface-raised);
		box-shadow: none;
		color: var(--ink);
	}
	.opt.sel .cur {
		color: var(--ink-on-inverse-secondary);
	}
	.opt.focus {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: calc(-1 * var(--focus-width));
	}
	.name {
		overflow-wrap: anywhere;
		hyphens: auto;
		min-inline-size: 0;
	}
	.cur,
	.level {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		white-space: nowrap;
	}
	.picker {
		display: grid;
		gap: var(--space-3);
	}
	.control {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.control:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.affix {
		display: inline-flex;
		color: var(--ink-secondary);
	}
	input {
		flex: 1;
		inline-size: 100%;
		min-inline-size: 0;
		padding: 0;
		border: 0;
		background: none;
		min-block-size: max(var(--control-height), var(--target));
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
	}
	input:focus-visible {
		outline: none;
	}
	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	.emoji {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(max(var(--control-height), var(--target)), 1fr));
		gap: var(--space-1);
		font-size: var(--type-title-size);
	}
	.emoji li {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
	}
	.emoji li.sel {
		background: var(--surface-selected);
		box-shadow: var(--ring-selected);
	}
	.emoji li.focus {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.badge {
		position: absolute;
		inset-block-start: calc(-1 * var(--space-1));
		inset-inline-end: calc(-1 * var(--space-1));
		display: grid;
		place-items: center;
		inline-size: var(--space-5);
		block-size: var(--space-5);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.none {
		padding: var(--space-8) var(--space-3);
	}
	.toasts {
		display: grid;
		grid-template-areas: 'stack';
		align-items: end;
		inline-size: 100%;
		padding-block-start: var(--space-6);
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
