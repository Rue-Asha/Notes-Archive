<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { newNote } from '#lib/notes/api.ts';
	import Button from '#lib/ui/Button.svelte';
</script>

<section class="welcome" data-welcome>
	<h2 class="display">{COPY.welcome}</h2>
	<Button onclick={() => newNote()}>{COPY.newNote}</Button>
</section>

<style>
	.welcome {
		display: grid;
		justify-items: start;
		gap: var(--s-5);
		padding: var(--s-7) var(--s-5);
		border-radius: var(--r-2xl);
		background: var(--accent-soft);
	}

	h2 {
		font-size: var(--t-display-3);
	}
</style>
