<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import { COPY } from '#lib/copy.ts';
	import type { SaveState } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { state, onretry }: { state: SaveState; onretry(): void } = $props();

	const labels: Record<SaveState, string> = {
		idle: COPY.saved,
		pending: COPY.saving,
		saving: COPY.saving,
		saved: COPY.saved,
		error: COPY.saveFailed,
		deleted: COPY.noteDeleted
	};
</script>

<!-- quiet on purpose: no live region and no transition, the toast speaks up when a save fails -->
{#if state === 'error'}
	<Button variant="danger" size="s" data-save-state={state} onclick={onretry}><Icon name="alert" size={16} />{labels[state]}</Button>
{:else}
	<p class="detail-status" data-save-state={state}>
		{#if state === 'saved' || state === 'idle'}<Icon name="check" size={14} />{/if}{labels[state]}
	</p>
{/if}
