<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Icon from './Icon.svelte';
	import type { Status } from './data.ts';

	let { status }: { status: Status } = $props();
</script>

{#if status === 'error'}
	<Button variant="danger" size="s"><Icon name="alert" size={16} />Couldn’t save — try again</Button>
{:else if status === 'deleted'}
	<p class="detail-status">Not saved</p>
{:else}
	<p class="detail-status"><Icon name={status === 'saving' ? 'clock' : 'check'} size={14} />{status === 'saving' ? 'Saving…' : 'Saved'}</p>
{/if}
