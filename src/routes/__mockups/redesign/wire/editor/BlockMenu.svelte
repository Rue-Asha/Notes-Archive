<script lang="ts">
	import Icon from '../note/Icon.svelte';

	type Props = { first?: boolean; last?: boolean; turnInto?: boolean };
	let { first = false, last = false, turnInto = false }: Props = $props();

	const turn = ['Text', 'Heading 1', 'Heading 2', 'Heading 3', 'Bullet list', 'Numbered list', 'Task list', 'Quote', 'Code', 'Callout'];
</script>

<div class="wrap">
	<button type="button" class="w-icon handle" aria-label="Block actions" aria-haspopup="menu" aria-expanded="true"><Icon name="grip" /></button>
	<ul class="w-menu" role="menu" aria-label="Block menu">
		<li role="none"><button type="button" role="menuitem" disabled={first}>Move up</button></li>
		<li role="none"><button type="button" role="menuitem" disabled={last}>Move down</button></li>
		<li role="none"><button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={turnInto}>Turn into<Icon name="caret" /></button></li>
		<li role="separator"></li>
		<li role="none"><button type="button" role="menuitem">Delete</button></li>
	</ul>
	{#if turnInto}
		<ul class="w-menu turn" role="menu" aria-label="Turn into">
			{#each turn as label, i (label)}<li role="none"><button type="button" role="menuitem" aria-current={i === 0}>{label}</button></li>{/each}
		</ul>
	{/if}
</div>

<style>
	.wrap { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-2); align-items: flex-start; }
	.handle { box-shadow: var(--ring-hairline); background: var(--surface-tint); }
	.w-menu { align-self: flex-start; }
	.turn { min-inline-size: 11rem; }
	[aria-current="true"] { background: var(--surface-tint-strong); }
</style>
