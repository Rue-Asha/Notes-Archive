<script lang="ts">
	import { flushSync, tick } from 'svelte';
	import type { Editor } from '@tiptap/core';
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
	<div class="bar" class:wide={linking || palette} role="toolbar" aria-label="Format">
		{#if linking}
			<LinkField href={editor?.getAttributes('link').href ?? ''} onapply={apply} onremove={remove} oncancel={cancel} />
		{:else if palette}
			<button type="button" class="tool" aria-label="Close colours" data-press="round" onmousedown={(e) => e.preventDefault()} onclick={() => (palette = false)}>
				<span class="back"><Icon name="arrow-right" size={17} /></span>
			</button>
			<span class="group swatches" role="group" aria-label="Text colour">
				<button type="button" class="text" data-press onmousedown={(e) => e.preventDefault()} onclick={() => color(null)}>
					<span class="chip plain" aria-hidden="true"></span>Default
				</button>
				{#each TEXT_COLORS as name (name)}
					<button type="button" class="text" data-press onmousedown={(e) => e.preventDefault()} onclick={() => color(name)}>
						<span class="chip" aria-hidden="true" style:--swatch="var(--text-{name})"></span>{name}
					</button>
				{/each}
			</span>
		{:else}
			<span class="group">
				{#each marks as mark (mark.name)}
					<button
						type="button"
						class="tool"
						aria-label={mark.label}
						aria-pressed={active(mark.name)}
						data-press="round"
						onmousedown={(e) => e.preventDefault()}
						onclick={() => editor && mark.toggle(editor)}
					>
						<Icon name={mark.icon} size={17} />
					</button>
				{/each}
			</span>
			<span class="group cell">
				<button type="button" class="tool" aria-label="Link" aria-pressed={active('link')} data-press="round" onmousedown={(e) => e.preventDefault()} onclick={() => (linking = true)}>
					<Icon name="link" size={17} />
				</button>
				<button type="button" class="tool" aria-label="Text colour" data-press="round" onmousedown={(e) => e.preventDefault()} onclick={() => (palette = true)}>
					<Icon name="palette" size={17} />
				</button>
			</span>
		{/if}
	</div>
{/if}

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1);
		inline-size: fit-content;
		max-inline-size: calc(100vw - 16px);
		padding: var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}

	.bar.wide {
		border-radius: var(--radius-bar-compact);
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	.cell {
		padding-inline-start: var(--space-1);
		box-shadow: var(--rule-beside);
	}

	.tool,
	.text {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-inline-size: max(var(--control-height-s), var(--target));
		min-block-size: max(var(--control-height-s), var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.text {
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
	}

	.tool[aria-pressed='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	.back {
		display: grid;
		transform: scaleX(-1);
	}

	.chip {
		flex: none;
		inline-size: var(--space-3-5);
		block-size: var(--space-3-5);
		border-radius: var(--radius-round);
		background: var(--swatch);
		box-shadow: var(--ring-hairline);
	}

	.chip.plain {
		background: var(--ink);
	}

	.swatches {
		flex: 1;
		justify-content: center;
	}

	@media (max-width: 480px) {
		.bar {
			justify-content: center;
			border-radius: var(--radius-bar-compact);
		}

		.cell {
			padding-inline-start: 0;
			box-shadow: none;
		}
	}

	@media (hover: hover) {
		.tool:not([aria-pressed='true']):hover,
		.text:hover {
			background: var(--surface-tint);
		}
	}
</style>
