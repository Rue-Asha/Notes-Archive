<script lang="ts">
	import { onMount } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { lf, titleKey } from './titleKeys.ts';

	type Props = { value: string; autofocus?: boolean; oninput(value: string): void; onblur?(): void; onenter?(): void };

	let { value, autofocus = false, oninput, onblur, onenter }: Props = $props();

	let field = $state<HTMLTextAreaElement>();
	let twin = $state<HTMLSpanElement>();
	let focused = $state(false);

	onMount(() => {
		if (autofocus) field?.focus();
	});

	// the last word carries the accent while the field is at rest
	const cut = $derived(value.trimEnd().search(/\S+$/));
	const lead = $derived(cut > 0 ? value.slice(0, cut) : '');
	const tail = $derived(cut > 0 ? value.slice(cut) : value);
	const long = $derived(value.length > 60 || value.split('\n').length > 3);

	// the twin lays out the same text as the field, so the rest of the title from the caret on one visual row means the
	// caret sits on the last row; the browser would only move it to the row's end there
	function onLastRow(offset: number): boolean {
		if (!twin) return false;
		const walker = document.createTreeWalker(twin, NodeFilter.SHOW_TEXT);
		const range = document.createRange();
		let seen = 0;
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const length = node.textContent?.length ?? 0;
			if (offset <= seen + length) {
				range.setStart(node, offset - seen);
				break;
			}
			seen += length;
		}
		range.setEnd(twin, twin.childNodes.length);
		const tops = [...range.getClientRects()].filter((r) => r.width > 0).map((r) => r.top);
		return tops.every((top) => Math.abs(top - tops[tops.length - 1]) < 2);
	}

	// Enter is a line break; Cmd/Ctrl+Enter, or ArrowDown on the last row, goes on to the body
	function keydown(event: KeyboardEvent) {
		const el = event.currentTarget as HTMLTextAreaElement;
		const action = titleKey(event, el.value, el.selectionStart, el.selectionEnd);
		if (action === 'body' || (action === 'last' && onLastRow(el.selectionStart))) {
			event.preventDefault();
			onenter?.();
		} else if (action === 'last') {
			const at = el.selectionStart;
			setTimeout(() => {
				if (document.activeElement === el && el.selectionStart === at && el.selectionEnd === at) onenter?.();
			});
		}
	}

	function input(event: Event) {
		const el = event.currentTarget as HTMLTextAreaElement;
		if (el.value.includes('\r')) el.value = lf(el.value);
		oninput(el.value);
	}
</script>

<!-- the twin carries the same text, so the grid cell (and the textarea in it) grows with every wrapped line -->
<!-- svelte-ignore a11y_missing_content (the heading's name is the textarea's value) -->
<h1 class="title" class:long class:focused data-note-title>
	<span class="twin" aria-hidden="true" bind:this={twin}>{lead}<em class="accent-word">{tail}</em>{' '}</span>
	<textarea
		bind:this={field}
		{value}
		rows="1"
		aria-label="Title"
		placeholder={COPY.untitled}
		spellcheck="false"
		{...{ autocorrect: 'off' }}
		oninput={input}
		onkeydown={keydown}
		onfocus={() => (focused = true)}
		onblur={() => {
			focused = false;
			onblur?.();
		}}
	></textarea>
</h1>

<style>
	.title {
		display: grid;
		inline-size: 100%;
		min-inline-size: 0;
		max-inline-size: 18em;
	}

	.title.long {
		max-inline-size: 26em;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
	}

	@media (max-width: 767px) {
		.title:not(.long) {
			font-size: var(--type-display-xl-size-compact);
		}
	}

	.twin,
	textarea {
		grid-area: 1 / 1;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		font: inherit;
		letter-spacing: inherit;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		text-wrap: pretty;
	}

	.twin {
		pointer-events: none;
	}

	.focused .twin {
		visibility: hidden;
	}

	textarea {
		overflow: hidden;
		resize: none;
		background: transparent;
		color: transparent;
		caret-color: var(--ink);
		outline: none;
	}

	.focused textarea {
		color: var(--ink);
	}

	textarea::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}
</style>
