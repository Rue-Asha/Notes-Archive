<script module lang="ts">
	export type Item = { label: string; kind?: 'danger' | 'disabled'; checked?: boolean; hint?: string; sep?: boolean };
</script>

<script lang="ts">
	let { name, items, radio = false }: { name: string; items: Item[]; radio?: boolean } = $props();
</script>

<div class="menu" role="menu" aria-label={name}>
	{#each items as item (item.label)}
		{#if item.sep}<hr />{/if}
		<button
			type="button"
			class="item"
			class:checked={item.checked}
			class:danger={item.kind === 'danger'}
			class:radio
			role={radio ? 'menuitemradio' : 'menuitem'}
			aria-checked={radio ? !!item.checked : undefined}
			disabled={item.kind === 'disabled'}
		>
			{#if radio}<span class="check" aria-hidden="true">{item.checked ? '✓' : ''}</span>{/if}
			<span class="text">{item.label}</span>
			{#if item.hint}<span class="hint">{item.hint}</span>{/if}
		</button>
	{/each}
</div>

<style>
	.menu {
		display: grid;
		gap: var(--space-0-5);
		inline-size: min(100%, 16rem);
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		min-inline-size: 0;
	}
	hr {
		inline-size: 100%;
		margin: var(--space-1) 0;
		border: 0;
		block-size: var(--stroke-hairline);
		background: var(--hairline);
	}
	.item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: transparent;
		text-align: start;
	}
	.item.radio { grid-template-columns: var(--space-5) minmax(0, 1fr) auto; }
	.item.checked { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.item.danger { font-weight: var(--weight-semibold); }
	.item:disabled { color: var(--ink-muted); opacity: var(--disabled-opacity); }
	.text { overflow-wrap: anywhere; }
	.hint { color: var(--ink-muted); font-size: var(--type-caption-size); }
</style>
