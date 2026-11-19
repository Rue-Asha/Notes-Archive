<script lang="ts">
	import type { TagRef } from '#lib/types.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import CloseIcon from '#lib/ui/Icon.svelte';
	import { addTag, splitCommas, suggest } from './tagInput.ts';

	let { selected, known, labelledby, onchange }: { selected: string[]; known: TagRef[]; labelledby: string; onchange(names: string[]): void } = $props();

	let typed = $state('');
	let active = $state(-1);
	let input = $state<HTMLInputElement>();

	const options = $derived(suggest(known, selected, typed));

	function confirm(raw: string) {
		const next = addTag(selected, known, raw);
		if (next !== selected) onchange(next);
		typed = '';
		active = -1;
	}

	function oninput() {
		active = -1;
		const split = splitCommas(selected, known, typed);
		if (split.selected !== selected) onchange(split.selected);
		typed = split.rest;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			confirm(options[active]?.name ?? typed);
		} else if (event.key === 'Backspace' && typed === '' && selected.length) {
			onchange(selected.slice(0, -1));
		} else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
			event.preventDefault();
			active = (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
		} else if (event.key === 'Escape' && typed) {
			event.stopPropagation();
			typed = '';
		}
	}

	function remove(name: string) {
		onchange(selected.filter((s) => s !== name));
		input?.focus();
	}
</script>

{#if selected.length}
	<ul class="chips" aria-labelledby={labelledby}>
		{#each selected as name (name)}
			<li class="chip" data-tag-chip>
				<span class="chip-text">{name}</span>&#8288;<button type="button" class="chip-x hit" aria-label="Remove {name}" data-press="round" onclick={() => remove(name)}><CloseIcon name="close" size={12} /></button>
			</li>
		{/each}
	</ul>
{/if}
<div class="add-wrap">
	<label class="add">
		<span class="sr-only">Add a tag</span>
		<input
			bind:this={input}
			bind:value={typed}
			{oninput}
			{onkeydown}
			role="combobox"
			aria-expanded={options.length > 0}
			aria-controls="tag-suggestions"
			aria-autocomplete="list"
			aria-activedescendant={active >= 0 ? `tag-option-${options[active].id}` : undefined}
			placeholder="Add a tag"
			autocomplete="off"
			autocapitalize="off"
			autocorrect="off"
			spellcheck="false"
			enterkeyhint="done"
		/>
	</label>
	{#if options.length}
		<!-- pointerdown keeps the focus in the input, so the click lands before anything blurs -->
		<div class="suggest" id="tag-suggestions" role="listbox" aria-label="Tag suggestions">
			{#each options as tag, i (tag.id)}
				<button
					type="button"
					role="option"
					id="tag-option-{tag.id}"
					class="option"
					aria-selected={i === active}
					tabindex="-1"
					onpointerdown={(e) => e.preventDefault()}
					onclick={() => confirm(tag.name)}
				>
					<Icon name="tag" size={16} /><span>{tag.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		min-inline-size: 0;
		max-inline-size: 100%;
	}

	.chip {
		display: block;
		min-inline-size: 0;
		max-inline-size: 100%;
		padding: var(--space-0-5) var(--space-0-5) var(--space-0-5) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
		line-height: calc(var(--target-min) + var(--space-0-5));
	}

	.chip-text {
		overflow-wrap: anywhere;
		hyphens: auto;
	}

	.chip-x {
		position: relative;
		display: inline-grid;
		place-items: center;
		inline-size: var(--target-min);
		block-size: var(--target-min);
		margin-inline-start: var(--space-1);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-control-solid);
		color: var(--ink);
		vertical-align: middle;
	}

	/* touch keeps a 44 px target around the small round button */
	@media (max-width: 1099px), (pointer: coarse) {
		.chip-x {
			inline-size: var(--target-touch);
			block-size: var(--target-touch);
			margin: calc((var(--target-min) - var(--target-touch)) / 2);
			margin-inline-start: calc((var(--target-min) - var(--target-touch)) / 2 + var(--space-1));
			background: transparent;
		}

		.chip-x::after {
			content: '';
			position: absolute;
			inset: calc((var(--target-touch) - var(--target-min)) / 2);
			border-radius: var(--radius-round);
			background: var(--surface-control-solid);
		}

		.chip-x :global(svg) {
			position: relative;
			z-index: var(--z-raised);
		}

		.chips {
			gap: var(--space-3);
		}
	}

	@media (hover: hover) {
		.chip-x:hover {
			background: var(--surface-inverse);
			color: var(--ink-on-inverse);
		}
	}

	.add-wrap {
		position: relative;
		display: grid;
		flex: 1 1 12rem;
		gap: var(--space-1);
		min-inline-size: 0;
		max-inline-size: min(100%, 18rem);
	}

	.add {
		display: block;
		min-inline-size: 0;
	}

	.add input {
		inline-size: 100%;
		min-block-size: max(var(--control-height-xs), var(--target));
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
		/* 16px: iOS zooms the page into anything smaller */
		font: inherit;
		font-size: max(16px, var(--type-body-s-size));
	}

	.add input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.suggest {
		position: absolute;
		inset-block-start: calc(100% + var(--space-1));
		inset-inline-start: 0;
		z-index: var(--z-menu);
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: min(14rem, 100%);
		max-inline-size: calc(100vw - 2 * var(--gutter));
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
	}

	.option {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
		min-block-size: max(var(--control-height-xs), var(--target));
		padding: 0 var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-body-s-size);
		text-align: start;
	}

	.option span {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.option:hover,
	.option[aria-selected='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
</style>
