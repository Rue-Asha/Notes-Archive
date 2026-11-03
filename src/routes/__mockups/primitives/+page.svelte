<script lang="ts">
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import EmojiPicker from '#lib/ui/EmojiPicker.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import FolderPicker from '#lib/ui/FolderPicker.svelte';
	import Menu, { type MenuItem } from '#lib/ui/Menu.svelte';
	import Sheet from '#lib/ui/Sheet.svelte';
	import type { Tree, TreeFolder } from '#lib/types.ts';
	import { toast } from '#lib/shell/toast.ts';

	let result = $state('');
	let dialog = $state<'plain' | 'danger' | null>(null);
	let menuOpen = $state(false);
	let menuAnchor = $state<HTMLElement | null>(null);
	let sheet = $state<'left' | 'bottom' | 'full' | null>(null);
	let folderOpen = $state(false);
	let emojiOpen = $state(false);
	let emojiAnchor = $state<HTMLElement | null>(null);

	const folder = (id: number, name: string, children: TreeFolder[] = []): TreeFolder => ({ id, name, parentId: null, children, notes: [] });
	const tree: Tree = {
		folders: [folder(1, 'Travel', [folder(2, 'Japan', [folder(3, 'Kyoto')]), folder(4, 'Italy')]), folder(5, 'Recipes')],
		rootNotes: []
	};

	const items: MenuItem[] = [
		{ label: 'Rename', icon: 'file', onselect: () => (result = 'selected Rename') },
		{ label: 'Duplicate', icon: 'link', disabled: true, onselect: () => (result = 'selected Duplicate') },
		{ label: 'Move', icon: 'move', onselect: () => (result = 'selected Move') },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: () => (result = 'selected Delete') }
	];

	function answer(value: string) {
		result = value;
		dialog = null;
	}

	function closeSheet() {
		sheet = null;
		result = 'closed';
	}
</script>

<svelte:head><title>Primitives · Notes Archive mockups</title></svelte:head>

<main>
	<header>
		<Eyebrow>Primitives — Dialog — Menu — Sheet — Toast</Eyebrow>
		<h1 class="display">Things that <em>open</em></h1>
	</header>

	<p class="result" data-result aria-live="polite">{result}</p>

	<section>
		<Eyebrow>Dialog</Eyebrow>
		<div class="row">
			<Button variant="secondary" arrow={false} onclick={() => (dialog = 'plain')}>Open dialog</Button>
			<Button variant="secondary" arrow={false} onclick={() => (dialog = 'danger')}>Open danger dialog</Button>
		</div>
	</section>

	<section>
		<Eyebrow>Menu</Eyebrow>
		<div class="row">
			<button type="button" class="open-btn" bind:this={menuAnchor} aria-haspopup="menu" aria-expanded={menuOpen} onclick={() => (menuOpen = true)}>Open menu</button>
		</div>
	</section>

	<section>
		<Eyebrow>Sheet</Eyebrow>
		<div class="row">
			<Button variant="secondary" arrow={false} onclick={() => (sheet = 'left')}>Open drawer</Button>
			<Button variant="secondary" arrow={false} onclick={() => (sheet = 'bottom')}>Open bottom sheet</Button>
			<Button variant="secondary" arrow={false} onclick={() => (sheet = 'full')}>Open full sheet</Button>
		</div>
	</section>

	<section>
		<Eyebrow>Pickers</Eyebrow>
		<div class="row">
			<Button variant="secondary" arrow={false} onclick={() => (folderOpen = true)}>Open folder picker</Button>
			<button type="button" class="open-btn" bind:this={emojiAnchor} aria-haspopup="dialog" aria-expanded={emojiOpen} onclick={() => (emojiOpen = true)}>Open emoji picker</button>
		</div>
	</section>

	<section>
		<Eyebrow>Toast</Eyebrow>
		<div class="row">
			<Button variant="secondary" arrow={false} onclick={() => toast('Moved to Travel')}>Show toast</Button>
			<Button variant="secondary" arrow={false} onclick={() => toast("Couldn't save — try again", 'error')}>Show error toast</Button>
		</div>
	</section>
</main>

<Dialog
	open={dialog !== null}
	title="Delete this note?"
	message="It leaves its folder and can't be brought back."
	confirmLabel="Delete"
	danger={dialog === 'danger'}
	onconfirm={() => answer('confirmed')}
	oncancel={() => answer('cancelled')}
/>

<Menu open={menuOpen} anchor={menuAnchor} label="Actions" {items} onclose={() => (menuOpen = false)} />

<FolderPicker
	open={folderOpen}
	{tree}
	current={5}
	exclude={2}
	onpick={(id) => {
		folderOpen = false;
		result = `picked ${id ?? 'root'}`;
	}}
	oncancel={() => (folderOpen = false)}
/>

<EmojiPicker open={emojiOpen} anchor={emojiAnchor} onpick={(emoji) => (result = `emoji ${emoji ?? 'removed'}`)} onclose={() => (emojiOpen = false)} />

{#each ['left', 'bottom', 'full'] as const as side (side)}
	<Sheet open={sheet === side} {side} label="Specimen {side === 'left' ? 'drawer' : `${side} sheet`}" onclose={closeSheet}>
		<div class="sheet-body">
			<Eyebrow>{side}</Eyebrow>
			<p>Escape, the scrim and the back gesture all close this.</p>
			<Button variant="secondary" arrow={false} onclick={() => history.back()}>Close</Button>
		</div>
	</Sheet>
{/each}

<style>
	main {
		display: grid;
		gap: var(--s-8);
		max-inline-size: 1100px;
		margin-inline: auto;
		padding: var(--s-8) var(--gutter) var(--s-11);
	}

	header,
	section {
		display: grid;
		gap: var(--s-3);
		align-content: start;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
	}

	.result {
		min-block-size: 1.5em;
		color: var(--ink-2);
	}

	.open-btn {
		min-block-size: var(--control);
		padding: 0 var(--s-6);
		border: 1px solid var(--ink);
		border-radius: var(--r-pill);
		background: transparent;
	}

	.sheet-body {
		display: grid;
		gap: var(--s-4);
		justify-items: start;
		padding: var(--s-7);
	}
</style>
