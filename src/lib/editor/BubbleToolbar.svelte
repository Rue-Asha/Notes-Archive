<script lang="ts">
	import { flushSync, tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { fadeSlide } from '#lib/motion.ts';
	import Icon, { type IconName } from '#lib/ui/Icon.svelte';
	import { TEXT_COLORS } from './core.ts';
	import LinkField from './LinkField.svelte';

	let editor = $state.raw<Editor | null>(null);
	let version = $state(0);
	let shown = $state(false);
	let palette = $state(false);
	let linking = $state(false);

	// the bar changes width between its modes, and the plugin only re-centres it on transactions
	$effect(() => {
		void linking;
		void palette;
		tick().then(() => editor?.view.dispatch(editor.state.tr.setMeta('bubbleMenu', 'updatePosition')));
	});

	export function attach(next: Editor) {
		editor = next;
		next.on('transaction', () => version++);
	}

	// the plugin measures the element right after onShow, so it must be rendered by then
	export function show() {
		flushSync(() => (shown = true));
	}

	export function hide() {
		shown = false;
		palette = false;
		linking = false;
	}

	export function link() {
		palette = false;
		flushSync(() => (linking = true));
	}

	// a bare host or path would be stored as a relative link
	const withScheme = (href: string) => (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href) ? href : `https://${href}`);

	function apply(href: string) {
		editor?.chain().focus().extendMarkRange('link').setLink({ href: withScheme(href) }).run();
		linking = false;
	}

	function remove() {
		editor?.chain().focus().extendMarkRange('link').unsetLink().run();
		linking = false;
	}

	function cancel() {
		linking = false;
		editor?.commands.focus();
	}

	const marks: { name: string; label: string; icon: IconName; toggle: (e: Editor) => void }[] = [
		{ name: 'bold', label: 'Bold', icon: 'bold', toggle: (e) => void e.chain().focus().toggleBold().run() },
		{ name: 'italic', label: 'Italic', icon: 'italic', toggle: (e) => void e.chain().focus().toggleItalic().run() },
		{ name: 'strike', label: 'Strikethrough', icon: 'strike', toggle: (e) => void e.chain().focus().toggleStrike().run() },
		{ name: 'code', label: 'Inline code', icon: 'code', toggle: (e) => void e.chain().focus().toggleCode().run() }
	];

	const active = (name: string) => {
		void version;
		return editor?.isActive(name) ?? false;
	};

	function color(name: (typeof TEXT_COLORS)[number] | null) {
		if (name) editor?.chain().focus().setTextColor(name).run();
		else editor?.chain().focus().unsetTextColor().run();
		palette = false;
	}
</script>

{#if shown}
	<div class="bar glass strong" role="toolbar" aria-label="Format" in:fadeSlide={{ y: 4 }}>
		{#if linking}
			<LinkField href={editor?.getAttributes('link').href ?? ''} onapply={apply} onremove={remove} oncancel={cancel} />
		{:else if palette}
			<div class="swatches" role="group" aria-label="Text colour">
				{#each TEXT_COLORS as name (name)}
					<button type="button" class="swatch" aria-label={name} style:--swatch="var(--text-{name})" onmousedown={(e) => e.preventDefault()} onclick={() => color(name)}></button>
				{/each}
				<button type="button" class="default" onmousedown={(e) => e.preventDefault()} onclick={() => color(null)}>Default</button>
				<button type="button" class="tool" aria-label="Close colours" onmousedown={(e) => e.preventDefault()} onclick={() => (palette = false)}>
					<Icon name="close" size={17} />
				</button>
			</div>
		{:else}
			{#each marks as mark (mark.name)}
				<button
					type="button"
					class="tool"
					aria-label={mark.label}
					aria-pressed={active(mark.name)}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => editor && mark.toggle(editor)}
				>
					<Icon name={mark.icon} size={17} />
				</button>
			{/each}
			<button type="button" class="tool" aria-label="Link" aria-pressed={active('link')} onmousedown={(e) => e.preventDefault()} onclick={() => (linking = true)}>
				<Icon name="link" size={17} />
			</button>
			<span class="rule"></span>
			<button type="button" class="tool" aria-label="Text colour" onmousedown={(e) => e.preventDefault()} onclick={() => (palette = true)}>
				<Icon name="palette" size={17} />
			</button>
		{/if}
	</div>
{/if}

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: var(--s-1) var(--s-2);
		border-radius: var(--r-pill);
		box-shadow: var(--glass-rim), var(--shadow-float);
		font-size: var(--t-small);
		line-height: 1;
	}

	.strong {
		background-color: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.tool {
		display: inline-grid;
		place-items: center;
		min-inline-size: 36px;
		block-size: 36px;
		padding: 0;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink);
	}

	.tool:hover {
		background: var(--row-hover);
	}

	.tool[aria-pressed='true'] {
		background: var(--accent-wash);
		color: var(--accent);
	}

	.rule {
		inline-size: 1px;
		block-size: 18px;
		margin-inline: var(--s-1);
		background: var(--line);
	}

	.swatches {
		display: flex;
		align-items: center;
		gap: var(--s-2);
		padding-inline: var(--s-2);
	}

	.swatch {
		inline-size: 24px;
		block-size: 24px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--swatch);
	}

	.default {
		padding: var(--s-1) var(--s-2);
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: var(--ink);
		font-size: var(--t-small);
	}

	.default:hover {
		background: var(--row-hover);
	}
</style>
