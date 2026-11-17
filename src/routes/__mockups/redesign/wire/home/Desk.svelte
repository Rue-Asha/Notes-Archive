<script lang="ts">
	import type { MockCard } from '../../fixtures.ts';
	import Icon from '../note/Icon.svelte';
	import Entry from './Entry.svelte';

	type Props = { pinned: MockCard[]; recent: MockCard[]; empty?: boolean; menu?: { list: 'pinned' | 'recent'; id: number } | null };
	let { pinned, recent, empty = false, menu = null }: Props = $props();

	let order = $state<MockCard[] | null>(null);
	const pins = $derived(order ?? pinned);
	// svelte-ignore state_referenced_locally
	let open = $state<string | null>(menu ? `${menu.list}-${menu.id}` : null);

	const toggle = (key: string) => (open = open === key ? null : key);
	function move(from: number, to: number) {
		const next = [...pins];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		order = next;
		open = null;
	}
</script>

<div class="desk">
	<div class="actions">
		<button type="button" class="w-btn search" aria-label="Search notes">
			<Icon name="search" /><span class="hint">Search notes</span><kbd class="w-kbd">Ctrl K</kbd>
		</button>
		<button type="button" class="w-btn primary"><Icon name="plus" />New note</button>
	</div>

	{#if empty}
		<section class="w-card welcome" aria-label="Welcome">
			<h2>Write your first note</h2>
			<p>Notes you write live here, filed in folders and findable by search.</p>
			<button type="button" class="w-btn primary"><Icon name="plus" />New note</button>
		</section>
	{:else}
		<div class="lists" class:single={pins.length === 0}>
			{#if pins.length}
				<section class="w-card" aria-labelledby="pinned-h">
					<div class="w-card-head"><h2 id="pinned-h">Pinned</h2><span class="w-note">{pins.length}</span></div>
					<ul>
						{#each pins as card, i (card.id)}
							<Entry
								{card}
								pinned
								open={open === `pinned-${card.id}`}
								ontoggle={() => toggle(`pinned-${card.id}`)}
								reorder={pins.length > 1 ? { canUp: i > 0, canDown: i < pins.length - 1, up: () => move(i, i - 1), down: () => move(i, i + 1) } : null}
							/>
						{/each}
					</ul>
				</section>
			{/if}
			<section class="w-card" aria-labelledby="recent-h">
				<div class="w-card-head"><h2 id="recent-h">Recently edited</h2><span class="w-note">{recent.length}</span></div>
				<ul>
					{#each recent as card (card.id)}
						<Entry {card} open={open === `recent-${card.id}`} ontoggle={() => toggle(`recent-${card.id}`)} />
					{/each}
				</ul>
			</section>
		</div>
	{/if}
</div>

<style>
	.desk { display: grid; gap: var(--space-5); min-inline-size: 0; }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	.search { flex: 1 1 16rem; justify-content: flex-start; min-block-size: var(--control-height); background: var(--surface-raised); box-shadow: var(--ring-control); color: var(--ink-secondary); }
	.search .hint { flex: 1; text-align: start; }
	.actions > .primary { min-block-size: var(--control-height); }
	.lists { display: grid; gap: var(--space-4); align-items: start; grid-template-columns: minmax(0, 1fr); }
	@media (min-width: 1000px) {
		.lists:not(.single) { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
	}
	.lists.single { max-inline-size: calc(var(--measure) + var(--space-16)); }
	.welcome { display: grid; justify-items: start; gap: var(--space-4); padding-block: var(--space-10); }
	.welcome p { max-inline-size: 40ch; color: var(--ink-secondary); }
</style>
