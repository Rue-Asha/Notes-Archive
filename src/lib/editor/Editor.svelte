<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor, getSchema } from '@tiptap/core';
	import { softKeyboard } from '#lib/shell/keyboard.svelte.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { Id, JSONContent } from '#lib/types.ts';
	import { buildExtensions } from './extensions.ts';
	import { sanitize } from './sanitize.ts';

	type Props = { noteId: Id; content: JSONContent; onchange(content: JSONContent): void; onblur(): void };

	let { noteId, content, onchange, onblur }: Props = $props();

	let root = $state<HTMLDivElement>();
	// ProseMirror owns the document; deep $state would proxy it, so the editor sits in $state.raw and toolbar state reads
	// the version counter
	let editor = $state.raw<Editor | null>(null);
	let version = $state(0);

	export function focusStart() {
		editor?.commands.focus('start');
	}

	onMount(() => {
		const touch = matchMedia('(pointer: coarse)').matches;
		const extensions = buildExtensions({ noteId, toast, touch });
		editor = new Editor({
			element: root,
			extensions,
			content: sanitize(content, getSchema(extensions)),
			editorProps: { attributes: { class: 'prose', 'aria-label': 'Note body' } },
			onTransaction: () => version++,
			onUpdate: ({ editor }) => onchange(editor.getJSON() as JSONContent),
			onFocus: () => {
				if (touch) softKeyboard.open = true;
			},
			onBlur: () => {
				if (touch) softKeyboard.open = false;
				onblur();
			}
		});
		return () => {
			editor?.destroy();
			editor = null;
			softKeyboard.open = false;
		};
	});
</script>

<div class="editor" data-editor-root bind:this={root}></div>

<style>
	.editor :global(.ProseMirror) {
		min-block-size: 8em;
	}
</style>
