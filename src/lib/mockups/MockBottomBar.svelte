<script lang="ts">
	import Icon from '#lib/ui/Icon.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';

	let { active = 'home', fixed = true }: { active?: 'home' | 'search' | 'folders'; fixed?: boolean } = $props();
</script>

<GlassPanel as="nav" class="bottom-bar {fixed ? 'fixed' : 'inline'}" data-bottom-bar aria-label="Main">
	<a href="#home" class:active={active === 'home'}><Icon name="home" size={22} /><span>Home</span></a>
	<a href="#search" class:active={active === 'search'}><Icon name="search" size={22} /><span>Search</span></a>
	<a class="new" href="#new" aria-label="New note"><span class="round"><Icon name="plus" size={24} stroke={2} /></span></a>
	<a href="#folders" class:active={active === 'folders'}><Icon name="folder" size={22} /><span>Folders</span></a>
</GlassPanel>

<style>
	:global(.bottom-bar) {
		z-index: 30;
		inset-inline: var(--s-3);
		inset-block-end: calc(var(--s-3) + env(safe-area-inset-bottom));
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: center;
		block-size: 68px;
		padding-inline: var(--s-2);
		border-radius: var(--r-2xl);
	}

	:global(.bottom-bar.fixed) {
		position: fixed;
	}

	:global(.bottom-bar.inline) {
		position: absolute;
	}

	@media (min-width: 1024px) {
		:global(.bottom-bar.fixed) {
			display: none;
		}
	}

	a {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 2px;
		min-block-size: var(--control);
		border-radius: var(--r-xl);
		color: var(--ink-2);
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	a.active {
		background: var(--row-active);
		box-shadow: var(--row-active-shadow);
		color: var(--ink);
	}

	.new {
		margin-block: calc(var(--s-4) * -1);
	}

	.round {
		display: grid;
		place-items: center;
		inline-size: 56px;
		block-size: 56px;
		border-radius: var(--r-pill);
		background: var(--ink);
		color: var(--surface);
		box-shadow: var(--shadow-float);
	}
</style>
