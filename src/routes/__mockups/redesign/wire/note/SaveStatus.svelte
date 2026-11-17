<script lang="ts">
	import type { Status } from './data.ts';

	let { status }: { status: Status } = $props();
</script>

{#if status === 'error'}
	<button type="button" class="status error">Couldn't save — try again</button>
{:else if status === 'deleted'}
	<span class="status gone">This note was deleted</span>
{:else}
	<span class="status">{status === 'saving' ? 'Saving…' : 'Saved'}</span>
{/if}

<style>
	.status { display: inline-flex; align-items: center; min-block-size: var(--control-height-xs); padding-inline: var(--space-3); border-radius: var(--radius-pill); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); border: 0; background: transparent; white-space: normal; text-align: end; }
	.error { color: var(--ink); background: var(--surface-tint); box-shadow: var(--ring-control); font-weight: var(--weight-medium); text-decoration: underline; text-underline-offset: 0.2em; }
	.gone { color: var(--ink); font-weight: var(--weight-medium); }
</style>
