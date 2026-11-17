<script lang="ts">
	import type { Snippet } from 'svelte';
	import NoteTitle from './NoteTitle.svelte';

	type Props = {
		title: string;
		autofocus?: boolean;
		inert?: boolean;
		ontitle(title: string): void;
		onblur?(): void;
		onenter?(): void;
		children?: Snippet;
	};

	let { title, autofocus = false, inert = false, ontitle, onblur, onenter, children }: Props = $props();
</script>

<header class="note-header" class:gone={inert} {inert} data-note-header>
	<NoteTitle value={title} {autofocus} oninput={ontitle} {onblur} {onenter} />
	{@render children?.()}
</header>

<style>
	.note-header {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
		padding-block: var(--space-3) var(--space-2);
	}

	.gone {
		opacity: var(--disabled-opacity);
	}
</style>
