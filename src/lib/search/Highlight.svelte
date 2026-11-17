<script lang="ts">
	import type { SnippetPart } from '#lib/types.ts';

	let { parts }: { parts: SnippetPart[] } = $props();
</script>

{#each parts as part, i (i)}{#if part.hit}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}

<style>
	mark {
		padding-inline: var(--space-0-5);
		border-radius: var(--radius-text);
		background: var(--accent-soft);
		color: var(--ink);
		font-weight: var(--weight-semibold);
	}
</style>
