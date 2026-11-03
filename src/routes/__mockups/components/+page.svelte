<script lang="ts">
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import Icon, { type IconName } from '#lib/ui/Icon.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import { photo } from '#lib/mockups/fixtures.ts';

	const strengths = ['soft', 'clear', 'frosted'] as const;
	const cardStyles = ['glass', 'paper', 'outline'] as const;
	const icons: IconName[] = ['home', 'search', 'plus', 'folder', 'folder-open', 'tag', 'pin', 'more', 'trash', 'move', 'image', 'file', 'link', 'bold', 'italic', 'code', 'palette', 'smile', 'sidebar', 'check'];
</script>

<svelte:head><title>Components · Notes Archive mockups</title></svelte:head>

<main>
	<header>
		<Eyebrow>Components — Atoms — Material</Eyebrow>
		<h1 class="display">Small parts, <em>one</em> language</h1>
	</header>

	<section>
		<Eyebrow>Buttons</Eyebrow>
		<div class="row">
			<Button data-cta>New note</Button>
			<Button variant="secondary">Cancel</Button>
			<Button variant="ghost">Skip</Button>
			<Button variant="danger" arrow={false}>Delete</Button>
			<ArrowButton label="Next" />
			<ArrowButton label="Next" variant="light" />
			<ArrowButton label="Next" variant="accent" />
			<IconButton icon="search" label="Search" />
			<IconButton icon="more" label="More" />
		</div>
	</section>

	<section>
		<Eyebrow>Chips and eyebrows</Eyebrow>
		<div class="row">
			<Chip label="architecture" data-chip />
			<Chip label="travel" onremove={() => {}} />
			<Chip label="Houses" href="#" />
			<Chip label="Pinned" class="chip-glass glass" />
		</div>
		<div class="row">
			<Eyebrow>Notes — Folders — Tags</Eyebrow>
			<Eyebrow>12 Sep 2026</Eyebrow>
			<span class="counter tnum">01 / 06</span>
		</div>
	</section>

	<section>
		<Eyebrow>Display</Eyebrow>
		<h2 class="display">Every note,<br /><em>in its place</em></h2>
	</section>

	<section>
		<Eyebrow>Icons</Eyebrow>
		<div class="icons">
			{#each icons as name (name)}
				<span class="icon-cell" title={name}><Icon {name} size={22} /></span>
			{/each}
		</div>
	</section>

	<section>
		<Eyebrow>Glass strengths over a photo and over the ground</Eyebrow>
		<div class="strengths">
			{#each strengths as strength (strength)}
				<div class="over photo-ground" data-strength={strength} data-glass={strength}>
					<img src={photo('lake-moraine')} alt="" />
					<GlassPanel class="sample"><p class="label">{strength}</p><p class="small">Over a photo</p></GlassPanel>
				</div>
				<div class="over" data-glass={strength}>
					<GlassPanel class="sample"><p class="label">{strength}</p><p class="small">Over the ground</p></GlassPanel>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<Eyebrow>The look as picked, then the three card styles</Eyebrow>
		<div class="cards">
			<GlassPanel class="sample" data-glass-sample><p class="label">Current glass</p><p class="small">From the page's look</p></GlassPanel>
			<div class="card sample" data-card-current><p class="label">Current card</p><p class="small">From the page's look</p></div>
		</div>
		<div class="cards">
			{#each cardStyles as style (style)}
				<div class="over photo-ground" data-card={style}>
					<img src={photo('interior-living')} alt="" />
					<div class="card sample" data-card-sample={style}><p class="label">{style}</p><p class="small">Note card, folder tile without cover</p></div>
				</div>
			{/each}
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--s-8);
		max-inline-size: 1100px;
		margin-inline: auto;
		padding: var(--s-8) var(--gutter) var(--s-11);
	}

	section {
		display: grid;
		gap: var(--s-4);
		align-content: start;
	}

	header {
		display: grid;
		gap: var(--s-3);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-4);
	}

	.counter {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		letter-spacing: -0.015em;
	}

	.icons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.icon-cell {
		display: inline-grid;
		place-items: center;
		inline-size: var(--control);
		block-size: var(--control);
		border: 1px solid var(--line);
		border-radius: var(--r-md);
	}

	:global(.chip-glass) {
		border-color: transparent;
	}

	.strengths {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--s-3);
	}

	@media (min-width: 768px) {
		.strengths {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}

	.cards {
		display: grid;
		gap: var(--s-3);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.over {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 160px;
		padding: var(--s-4);
		overflow: hidden;
		border-radius: var(--r-xl);
		border: 1px solid var(--line);
	}

	.photo-ground img {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.over > :global(.sample),
	.over > .sample {
		position: relative;
	}

	:global(.sample) {
		inline-size: 100%;
		padding: var(--s-4) var(--s-5);
	}

	.label {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		letter-spacing: -0.015em;
		line-height: 1.1;
	}

	.small {
		color: var(--ink-2);
		font-size: var(--t-small);
	}
</style>
