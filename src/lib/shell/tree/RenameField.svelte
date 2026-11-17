<script lang="ts">
	import { tick } from 'svelte';

	type Props = { value: string; onsubmit?: (name: string) => void; oncancel?: () => void; focused?: boolean };
	let { value, onsubmit, oncancel, focused = false }: Props = $props();

	// svelte-ignore state_referenced_locally
	let draft = $state(value);
	let settled = false;

	function commit() {
		if (settled) return;
		settled = true;
		onsubmit?.(draft.trim() || 'Untitled folder');
	}
	let field: HTMLInputElement;

	// Enter and Escape take the field away under the focus: it goes to the folder's row, or to its menu button in the
	// focus header
	function handBack() {
		const row = field.parentElement?.closest<HTMLElement>('[role=treeitem], .focus');
		void tick().then(() => {
			if (document.activeElement && document.activeElement !== document.body) return;
			const to = row?.matches('[role=treeitem]') ? row : row?.querySelector<HTMLElement>('.more');
			if (to?.isConnected) to.focus();
		});
	}
	function pick(node: HTMLInputElement) {
		field = node;
		node.focus();
		node.select();
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handBack();
			commit();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			settled = true;
			handBack();
			oncancel?.();
		}
	}
</script>

<input class="rename" class:focus={focused} type="text" aria-label="Folder name" autocomplete="off" bind:value={draft} onkeydown={key} onblur={commit} use:pick />

<style>
	.rename {
		flex: 1 1 0;
		inline-size: 0;
		min-inline-size: 0;
		min-block-size: max(var(--control-height-xs), var(--target));
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-body-s-size);
		text-overflow: ellipsis;
	}
	.focus {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	@media (pointer: coarse) {
		.rename {
			font-size: var(--type-body-size);
		}
	}
</style>
