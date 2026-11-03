<script lang="ts">
	import type { TagRef } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { addTag, splitCommas, suggest } from './tagInput.ts';

	let { selected, known, onchange }: { selected: string[]; known: TagRef[]; onchange(names: string[]): void } = $props();

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

{#each selected as name (name)}
	<Chip class="prop glass" label={name} onremove={() => remove(name)} data-tag-chip />
{/each}
<span class="entry prop add">
	<Icon name="plus" size={16} />
	<input
		bind:this={input}
		bind:value={typed}
		{oninput}
		{onkeydown}
		role="combobox"
		aria-label="Add a tag"
		aria-expanded={options.length > 0}
		aria-controls="tag-suggestions"
		aria-autocomplete="list"
		aria-activedescendant={active >= 0 ? `tag-option-${options[active].id}` : undefined}
		placeholder={selected.length ? 'Add tag' : 'Add a tag'}
		autocomplete="off"
		autocapitalize="off"
		enterkeyhint="done"
	/>
	{#if options.length}
		<div class="suggest glass strong" id="tag-suggestions" role="listbox" aria-label="Tag suggestions">
			{#each options as tag, i (tag.id)}
				<!-- pointerdown keeps the focus in the input, so the click lands before anything blurs -->
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
</span>

<style>
	.entry {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 34px;
		padding-inline: var(--s-3);
		border: 1px dashed color-mix(in srgb, var(--ink) 25%, transparent);
		border-radius: var(--r-pill);
		color: var(--ink-2);
		font-size: var(--t-small);
		font-weight: 500;
	}

	.entry:focus-within {
		border-color: var(--accent);
		color: var(--ink);
	}

	input {
		inline-size: 9ch;
		min-inline-size: 0;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ink);
		/* 16px: iOS zooms the page into anything smaller */
		font: inherit;
		font-size: max(16px, var(--t-small));
	}

	input:focus-visible {
		outline: none;
		box-shadow: none;
	}

	.suggest {
		position: absolute;
		inset-block-start: calc(100% + var(--s-2));
		inset-inline-start: 0;
		z-index: 20;
		display: grid;
		min-inline-size: 200px;
		max-inline-size: calc(100vw - 32px);
		padding: var(--s-2);
		border-radius: var(--r-lg);
		background: color-mix(in srgb, var(--glass-fallback) 92%, transparent);
	}

	.option {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		min-block-size: var(--control);
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink);
		font-size: var(--t-body);
		text-align: start;
	}

	.option:hover,
	.option[aria-selected='true'] {
		background: var(--row-hover);
	}
</style>
