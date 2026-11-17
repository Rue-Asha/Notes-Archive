<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockFolder } from '../../fixtures.ts';
	import Dialog from './Dialog.svelte';
	import Menu, { type Item } from './Menu.svelte';
	import Specimen from './Specimen.svelte';

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

	const noteMenu: Item[] = [
		{ label: 'Search', hint: '⌘K' },
		{ label: 'Unpin' },
		{ label: 'Move to…' },
		{ label: 'Delete', kind: 'danger', sep: true }
	];
	const entryMenu: Item[] = [{ label: 'Pin' }, { label: 'Move to…' }, { label: 'Delete', kind: 'danger', sep: true }];
	const pinnedMenu: Item[] = [
		{ label: 'Move up', kind: 'disabled' },
		{ label: 'Move down' },
		{ label: 'Unpin', sep: true },
		{ label: 'Move to…' },
		{ label: 'Delete', kind: 'danger', sep: true }
	];
	const folderMenu: Item[] = [
		{ label: 'New note' },
		{ label: 'New folder' },
		{ label: 'Rename', sep: true },
		{ label: 'Move to…' },
		{ label: 'Delete', kind: 'danger', sep: true }
	];
	const noCover: Item[] = [{ label: 'Add cover' }];
	const hasCover: Item[] = [{ label: 'Change cover' }, { label: 'Remove cover', kind: 'danger' }];
	// the four sort labels are chosen at gate 5; these are placeholders for the structure
	const sortMenu: Item[] = [
		{ label: 'Folders first, notes by edit', checked: true },
		{ label: 'Name' },
		{ label: 'Last edited' },
		{ label: 'Created' }
	];
	const sortLong: Item[] = $derived(data.worst ? sortMenu.map((m, i) => (i === 1 ? { ...m, checked: false } : m)) : sortMenu);

	const noteTitle = $derived(data.note.title || 'Untitled');
</script>

<svelte:head><title>Overlays · Notes Archive</title></svelte:head>

{#snippet cancel()}<button type="button" class="btn">Cancel</button>{/snippet}

<Frame>
	<section class="card panel">
		<h1 class="type-display-m">Dialogs, menus and toasts</h1>
		<p class="card-note">Everything is drawn open. Modal dialogs: focus moves in and is trapped, Esc and a click outside cancel, focus returns to the opener. Menus: arrows, Home and End move; Esc closes and returns focus. On phones a dialog is a bottom sheet.</p>
	</section>

	<section class="card panel" aria-labelledby="g-del">
		<h2 id="g-del" class="type-display-s">Delete confirm</h2>
		<div class="grid">
			<Specimen label="Note" note="Opened from the note menu or a note entry menu." sheet>
				<Dialog heading={`Delete “${noteTitle}”? This can't be undone.`} label="Delete note">
					{#snippet actions()}{@render cancel()}<button type="button" class="btn danger">Delete</button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Note without a title" sheet>
				<Dialog heading="Delete “Untitled”? This can't be undone." label="Delete note">
					{#snippet actions()}{@render cancel()}<button type="button" class="btn danger">Delete</button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · before the counts load" note="No dialog yet. The menu item shows it is busy; the dialog opens once counts are known.">
				<Menu name="{folderName} actions" items={[{ label: 'Delete', kind: 'disabled', hint: 'Checking…' }]} />
			</Specimen>
			<Specimen label="Folder · counts known" sheet>
				<Dialog title="Delete folder" heading={`Delete “${folderName}”? This deletes 3 folders and 12 notes inside it. This can't be undone.`}>
					{#snippet actions()}{@render cancel()}<button type="button" class="btn danger">Delete</button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · singular counts" sheet>
				<Dialog title="Delete folder" heading="Delete “Lisbon”? This deletes 1 folder and 1 note inside it. This can't be undone.">
					{#snippet actions()}{@render cancel()}<button type="button" class="btn danger">Delete</button>{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="Folder · empty" sheet>
				<Dialog title="Delete folder" heading="Delete “Empty one”? This can't be undone.">
					{#snippet actions()}{@render cancel()}<button type="button" class="btn danger">Delete</button>{/snippet}
				</Dialog>
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-move">
		<h2 id="g-move" class="type-display-s">Move to chooser</h2>
		<div class="grid">
			{#each [{ label: 'Moving a note: Root, then every folder in tree order', list: all }, { label: 'Moving a folder: itself and its descendants are left out', list: withoutTravel }] as c, n (c.label)}
				<Specimen label={c.label} note="The current location is marked. Picking applies at once." sheet>
					<Dialog title="Move to" label="Choose a folder" wide>
						<ul class="choose" role="listbox" aria-label="Choose a folder">
							<li class="opt" role="option" aria-selected={n === 1}>
								<span class="mark" aria-hidden="true">{n === 1 ? '✓' : ''}</span><span class="name">Root</span>{#if n === 1}<span class="cur">Current</span>{/if}
							</li>
							{#each c.list as f (f.id)}
								{@const here = n === 0 && f.id === currentId}
								<li class="opt" role="option" aria-selected={here} style:--depth={Math.min(f.depth - 1, 5)}>
									<span class="mark" aria-hidden="true">{here ? '✓' : ''}</span>
									<span class="name" title={f.name}>{f.name}</span>
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
		<h2 id="g-icon" class="type-display-s">Icon picker</h2>
		<div class="grid">
			<Specimen label="Results" note="Search filters by keyword. Arrows move through the emoji." sheet>
				<Dialog title="Icon" wide>
					<div class="picker">
						<input type="search" placeholder="Search emoji" aria-label="Search emoji" />
						<ul class="emoji" role="listbox" aria-label="Emoji">
							{#each emoji as [e, name], i (name)}
								<li role="option" aria-selected={i === 0} aria-label={name} data-current={i === 0 || undefined}>{e}</li>
							{/each}
						</ul>
					</div>
					{#snippet actions()}<button type="button" class="btn">Remove</button>{@render cancel()}{/snippet}
				</Dialog>
			</Specimen>
			<Specimen label="No match" sheet>
				<Dialog title="Icon" wide>
					<div class="picker">
						<input type="search" value={data.worst ? 'ꙮ'.repeat(3) + ' ' + data.search.query.slice(0, 40) : 'zzz'} aria-label="Search emoji" />
						<p class="none" role="status">No emoji match “{data.worst ? data.search.query.slice(0, 40) : 'zzz'}”</p>
					</div>
					{#snippet actions()}<button type="button" class="btn">Remove</button>{@render cancel()}{/snippet}
				</Dialog>
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-menus">
		<h2 id="g-menus" class="type-display-s">Menus</h2>
		<div class="grid">
			<Specimen label="Cover menu · no cover" note="On the folder page, from the cover control.">
				<Menu name="Cover" items={noCover} />
			</Specimen>
			<Specimen label="Cover menu · with a cover">
				<Menu name="Cover" items={hasCover} />
			</Specimen>
			<Specimen label="Note menu" note="Search stays reachable on touch while the editor has focus.">
				<Menu name="Note menu" items={noteMenu} />
			</Specimen>
			<Specimen label="Note actions · list entry">
				<Menu name="Note actions" items={entryMenu} />
			</Specimen>
			<Specimen label="Note actions · pinned entry" note="Move up is disabled at the top, Move down at the bottom.">
				<Menu name="Note actions" items={pinnedMenu} />
			</Specimen>
			<Specimen label="Folder menu" note="Named “{folderName} actions”.">
				<Menu name="{folderName} actions" items={folderMenu} />
			</Specimen>
			<Specimen label="Sort menu" note="Quiet icon button in the tree header; on the phone on Folders. Labels are chosen at gate 5.">
				<Menu name="Sort" items={sortLong} radio />
			</Specimen>
		</div>
	</section>

	<section class="card panel" aria-labelledby="g-toast">
		<h2 id="g-toast" class="type-display-s">Toasts</h2>
		<p class="card-note">About 4 s, announced politely. One visible per region; older ones peek behind it. A toast raised before a redirect survives to the next page.</p>
		<div class="grid">
			<Specimen label="One toast">
				<div class="toasts" role="status" aria-live="polite">
					<div class="toast"><span class="msg">Couldn't save — try again</span><button type="button" class="act">Retry</button><button type="button" class="dismiss" aria-label="Dismiss"><span aria-hidden="true">×</span></button></div>
				</div>
			</Specimen>
			<Specimen label="Three in a row: the newest on top" note="Older ones peek at a smaller scale.">
				<div class="toasts stack">
					<div class="toast back2" aria-hidden="true"><span class="msg">Files can be up to 16 MB</span></div>
					<div class="toast back1" aria-hidden="true"><span class="msg">That file isn't an image</span></div>
					<div class="toast"><span class="msg">Pinned order changed elsewhere — reloaded</span><button type="button" class="dismiss" aria-label="Dismiss"><span aria-hidden="true">×</span></button></div>
				</div>
			</Specimen>
			<Specimen label="Long message">
				<div class="toasts">
					<div class="toast"><span class="msg">{data.worst ? `Couldn't upload “${data.note.title.slice(0, 90)}” — try again` : "Couldn't upload — try again"}</span><button type="button" class="act">Retry</button><button type="button" class="dismiss" aria-label="Dismiss"><span aria-hidden="true">×</span></button></div>
				</div>
			</Specimen>
		</div>
	</section>
</Frame>

<style>
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
		gap: var(--space-0-5);
		max-block-size: 18rem;
		overflow-y: auto;
		padding: var(--space-1);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.opt {
		display: grid;
		grid-template-columns: var(--space-5) minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		padding-block: var(--space-1);
		padding-inline-end: var(--space-3);
		padding-inline-start: calc(var(--space-2) + var(--depth, 0) * var(--space-3));
		border-radius: var(--radius-item);
	}
	.opt[aria-selected='true'] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.name { overflow-wrap: anywhere; min-inline-size: 0; }
	.cur, .level { color: var(--ink-muted); font-size: var(--type-caption-size); white-space: nowrap; }
	[aria-selected='true'] .cur { color: var(--ink-on-inverse-secondary); }
	.picker { display: grid; gap: var(--space-3); }
	.picker input {
		inline-size: 100%;
		min-inline-size: 0;
		block-size: var(--control-height);
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		text-overflow: ellipsis;
	}
	.emoji {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--target-touch), 1fr));
		gap: var(--space-1);
		font-size: var(--type-title-size);
	}
	.emoji li {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
	}
	.emoji li[data-current] { box-shadow: var(--ring-selected); }
	.none {
		padding: var(--space-8) var(--space-3);
		text-align: center;
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}
	.toasts { inline-size: min(100%, 28rem); display: grid; }
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-5);
		min-block-size: var(--target-touch);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		min-inline-size: 0;
	}
	.msg { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; padding-block: var(--space-1); }
	.act, .dismiss {
		flex: none;
		min-block-size: var(--target);
		min-inline-size: var(--target);
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint);
		color: var(--ink-on-inverse);
	}
	.dismiss { padding-inline: 0; border-radius: var(--radius-round); background: transparent; }
	.stack { padding-block-start: var(--space-6); }
	.stack .toast { grid-area: 1 / 1; }
	.stack .back1, .stack .back2 { scale: var(--toast-stack-scale); background: var(--surface-inverse-raised); }
	.stack .back1 { translate: 0 calc(-1 * var(--space-3)); }
	.stack .back2 { translate: 0 calc(-2 * var(--space-3)); }
	.stack .toast:not(.back1):not(.back2) { position: relative; z-index: var(--z-raised); }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
