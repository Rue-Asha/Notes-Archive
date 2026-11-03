<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import type { SaveState } from '#lib/types.ts';

	let { state, onretry }: { state: SaveState; onretry(): void } = $props();

	const labels: Record<SaveState, string> = {
		idle: COPY.saved,
		pending: COPY.saving,
		saving: COPY.saving,
		saved: COPY.saved,
		error: COPY.saveFailed,
		deleted: ''
	};
</script>

<!-- quiet on purpose: no live region and no transition, the toast speaks up when a save fails -->
{#if state === 'error'}
	<button type="button" class="status error" data-save-state={state} onclick={onretry}>{labels[state]}</button>
{:else}
	<span class="status" data-save-state={state}>{labels[state]}</span>
{/if}

<style>
	.status {
		margin-inline-end: var(--s-2);
		color: var(--ink-2);
		font-size: var(--t-small);
		white-space: nowrap;
	}

	button {
		min-block-size: var(--control);
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-pill);
		background: var(--danger-soft);
		font: inherit;
		font-size: var(--t-small);
		font-weight: 500;
	}

	.error {
		color: var(--danger);
	}
</style>
