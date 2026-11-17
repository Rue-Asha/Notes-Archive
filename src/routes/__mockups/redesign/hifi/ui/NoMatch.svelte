<script lang="ts">
	type Props = { lead: string; query: string };
	let { lead, query }: Props = $props();
</script>

<p class="none" role="status">
	<span class="lead">{lead}</span>
	<span class="q" title={query}>“{query}”</span>
</p>

<style>
	.none {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.lead {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		text-wrap: balance;
	}
	.q {
		max-inline-size: 100%;
		color: var(--ink-secondary);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
</style>
