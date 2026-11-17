<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import RenameField from '#lib/shell/tree/RenameField.svelte';
	import { arrive, depart, reflow } from '#lib/ui/motion.ts';

	type Row = { id: Id; name: string; noteCount: number };
	type Props = { folders: Row[]; label?: string; renaming?: Id | null; onrename?: (id: Id, name: string) => void; oncancel?: () => void };

	let { folders, label = COPY.folders, renaming = null, onrename, oncancel }: Props = $props();
</script>

<ul class="rows" aria-label={label} data-folder-list>
	{#each folders as folder (folder.id)}
		<li animate:reflow in:arrive|global out:depart>
			{#if renaming === folder.id}
				<div class="row renaming">
					<Icon name="folder" size={20} />
					<RenameField value={folder.name} focused onsubmit={(name) => onrename?.(folder.id, name)} {oncancel} />
				</div>
			{:else}
				<a class="row" href="/folders/{folder.id}">
					<Icon name="folder" size={20} />
					<span class="name" lang="de">{folder.name}</span>
					<span class="count">{COPY.noteCount(folder.noteCount)}</span>
					<Icon name="chevronRight" size={16} />
				</a>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.rows {
		overflow: hidden;
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--shadow-lift);
	}

	li + li {
		box-shadow: var(--rule-above);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: var(--space-14);
		padding: var(--space-2-5) var(--space-5);
		color: var(--ink);
		text-decoration: none;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
	}

	.row > :global(svg) {
		flex: none;
		color: var(--ink-secondary);
	}

	.renaming {
		padding-block: var(--space-1);
	}

	.name {
		display: -webkit-box;
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		overflow-wrap: anywhere;
		hyphens: auto;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}

	.count {
		flex: none;
		color: var(--ink-secondary);
		font-size: var(--type-label-size);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
	}

	@media (hover: hover) {
		.row:hover {
			background: var(--surface-tint);
		}
	}

	.row:active {
		background: var(--surface-tint-strong);
	}
</style>
