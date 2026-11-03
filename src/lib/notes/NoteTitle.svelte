<script lang="ts">
	import { onMount } from 'svelte';
	import { COPY } from '#lib/copy.ts';

	type Props = { value: string; autofocus?: boolean; oninput(value: string): void; onblur?(): void; onenter?(): void };

	let { value, autofocus = false, oninput, onblur, onenter }: Props = $props();

	let field = $state<HTMLTextAreaElement>();

	onMount(() => {
		if (autofocus) field?.focus();
	});

	// a title is one line of text: Enter moves on to the body, pasted line breaks become spaces
	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.isComposing) return;
		event.preventDefault();
		onenter?.();
	}

	function input(event: Event) {
		const el = event.currentTarget as HTMLTextAreaElement;
		if (/[\r\n]/.test(el.value)) el.value = el.value.replace(/[\r\n]+/g, ' ');
		oninput(el.value);
	}
</script>

<!-- the hidden twin carries the same text, so the grid cell (and the textarea in it) grows with every wrapped line -->
<!-- svelte-ignore a11y_missing_content (the heading's name is the textarea's value) -->
<h1 class="title" data-note-title data-value={value}>
	<textarea
		bind:this={field}
		{value}
		rows="1"
		aria-label="Title"
		placeholder={COPY.untitled}
		spellcheck="true"
		oninput={input}
		onkeydown={keydown}
		{onblur}
	></textarea>
</h1>

<style>
	.title {
		display: grid;
		inline-size: 100%;
		font-size: var(--t-note-title);
		line-height: 1.04;
	}

	.title::after {
		content: attr(data-value) ' ';
		visibility: hidden;
		white-space: pre-wrap;
	}

	.title::after,
	textarea {
		grid-area: 1 / 1;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		font: inherit;
		letter-spacing: inherit;
		overflow-wrap: anywhere;
		text-wrap: wrap;
	}

	textarea {
		overflow: hidden;
		resize: none;
		background: transparent;
		color: var(--ink);
		outline: none;
	}

	textarea::placeholder {
		color: var(--muted);
		opacity: 1;
	}
</style>
