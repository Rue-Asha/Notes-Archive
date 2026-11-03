<script lang="ts">
	import type { SnippetPart } from '#lib/types.ts';

	let { parts }: { parts: SnippetPart[] } = $props();
</script>

{#each parts as part, i (i)}{#if part.hit}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}

<style>
	mark {
		padding: 0 2px;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--ink);
		font-weight: 600;
	}
</style>
