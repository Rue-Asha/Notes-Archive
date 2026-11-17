<script lang="ts">
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
	function key(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			settled = true;
			oncancel?.();
		}
	}
</script>

<input class="rename" class:focus={focused} type="text" aria-label="Folder name" autocomplete="off" bind:value={draft} onkeydown={key} onblur={commit} onfocus={(e) => e.currentTarget.select()} />

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
