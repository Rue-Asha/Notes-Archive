<script lang="ts">
	import { page } from '$app/state';
	import { mockData } from '../../fixtures.ts';
	import a from './variants/a.svg';
	import padA from './variants/pad-a.svg';
	import padA16 from './variants/pad-a-16.svg';
	import padA32 from './variants/pad-a-32.svg';
	import padB from './variants/pad-b.svg';
	import padB16 from './variants/pad-b-16.svg';
	import padB32 from './variants/pad-b-32.svg';
	import padC from './variants/pad-c.svg';
	import padC16 from './variants/pad-c-16.svg';
	import padC32 from './variants/pad-c-32.svg';
	import creative from './variants/family/creative.svg';
	import cooking from './variants/family/cooking.svg';
	import cooking16 from './variants/family/cooking-16.svg';
	import cooking32 from './variants/family/cooking-32.svg';

	const worst = $derived(mockData(new URL(page.url.href)).worst);

	type Variant = { id: string; name: string; src: string; s16: string; s32: string; job: string; idea: string };
	const variants: Variant[] = [
		{ id: 'pad-a', name: 'Pad and pencil', src: padA, s16: padA16, s32: padA32, job: 'write', idea: 'A top-bound pad with the pencil laid across its lower corner.' },
		{ id: 'pad-b', name: 'Pad, line', src: padB, s16: padB16, s32: padB32, job: 'write', idea: 'Two ruled lines, and the pencil tip finishing the last one.' },
		{ id: 'pad-c', name: 'Pad and standing pencil', src: padC, s16: padC16, s32: padC32, job: 'write, keep', idea: 'A top-bound pad with two dots of text, the pencil standing next to it.' }
	];
	const previous: Variant = { id: 'a', name: 'Filed', src: a, s16: a, s32: a, job: 'capture, file', idea: 'A note dropped into an open pocket. Previous master, kept for comparison.' };
	const family: Variant[] = [
		{ id: 'creative', name: 'Creative', src: creative, s16: creative, s32: creative, job: '', idea: '' },
		{ id: 'cooking', name: 'Cooking', src: cooking, s16: cooking16, s32: cooking32, job: '', idea: '' },
		previous,
		...variants
	];
	const withHint = (v: Variant, size: number) => (size === 16 ? v.s16 : size === 32 ? v.s32 : v.src);

	const small = [16, 32];
	const grounds = [
		{ name: 'Light ground', tone: 'light' },
		{ name: 'Dark ground', tone: 'dark' }
	];
</script>

<svelte:head><title>Icon · Notes Archive</title></svelte:head>

{#snippet mark(src: string, size: number, shape: 'circle' | 'squircle' | 'maskable' | 'maskable-squircle', grey = false)}
	<span class="mark {shape}" class:grey style:--size="{size}px">
		<img {src} alt="" width={size} height={size} class:inset={shape.startsWith('maskable')} />
	</span>
{/snippet}

<main class="page" data-data={worst ? 'worst' : 'normal'}>
	<section class="card panel" aria-labelledby="h">
		<div class="card-head"><h1 id="h">Master <em class="accent-word">icon</em>: notepad</h1></div>
		<p class="card-note">Request #16: the master becomes a notepad with a pencil, replacing Filed (picked: pad-a; the signed-off master lives in Design-System icons/Notes-Archive). Slate field, white strokes of 32 on the 512 grid, one solid white shape for the pencil. Each variant has its own hand-hinted 16 and 32 px drawing with strokes on the pixel grid. Not chosen yet.</p>
		<ol class="legend">
			{#each variants as v (v.id)}
				<li>
					{@render mark(v.src, 96, 'circle')}
					<div class="legend-text">
						<p class="type-overline">{v.id} · {v.job}</p>
						<h2>{v.name}</h2>
						<p>{v.idea}</p>
						<code>variants/{v.id}.svg, -16, -32</code>
					</div>
				</li>
			{/each}
			<li class="previous">
				{@render mark(previous.src, 96, 'circle')}
				<div class="legend-text">
					<p class="type-overline">previous · {previous.job}</p>
					<h2>{previous.name}</h2>
					<p>{previous.idea}</p>
					<code>variants/a.svg</code>
				</div>
			</li>
		</ol>
	</section>

	{#each grounds as g (g.tone)}
		<section class="card panel" aria-label={g.name}>
			<h2>{g.name}</h2>
			<div class="ground {g.tone}">
				<figure>
					<figcaption class="type-overline">Favicon 16 and 32 px (hinted), colour then greyscale</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{#each small as s (s)}{@render mark(withHint(v, s), s, 'circle')}{/each}
									{#each small as s (s)}{@render mark(withHint(v, s), s, 'circle', true)}{/each}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">Family: Creative, Cooking, Notes previous (Filed), then the three pads. 16, 32, 180 px</figcaption>
					{#each [16, 32, 180] as s (s)}
						<div class="row">
							{#each family as v (v.id)}
								<div class="cell">
									{@render mark(withHint(v, s), s, 'circle')}
									<span class="size">{v.id === 'a' ? 'previous' : v.id} · {s}</span>
								</div>
							{/each}
						</div>
					{/each}
				</figure>
				<figure>
					<figcaption class="type-overline">180 px: apple-touch under the iOS squircle, maskable under a squircle, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{@render mark(v.src, 180, 'squircle')}
									{@render mark(v.src, 180, 'maskable-squircle')}
									{@render mark(v.src, 180, 'maskable')}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">180 px greyscale</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="180px">{@render mark(v.src, 180, 'circle', true)}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">512 px, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="512px">{@render mark(v.src, 512, 'maskable')}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
			</div>
		</section>
	{/each}

	<section class="card panel" aria-labelledby="previous">
		<h2 id="previous">Previous: Filed</h2>
		<p class="card-note">The current <code>icon.svg</code> (variant a), kept visible for comparison until a pad is picked.</p>
		<div class="ground light">
			<div class="row">
				{#each [...small, 180] as s (s)}
					<div class="cell solo" style:--size="{s}px">{@render mark(previous.src, s, 'circle')}<span class="size">{s} px</span></div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		display: grid;
		gap: var(--space-4);
		max-inline-size: var(--frame-max-width);
		margin-inline: auto;
		padding: var(--space-4);
		background: var(--surface-page);
		min-block-size: 100dvh;
		min-inline-size: 0;
	}
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.card-head h1 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--space-16) * 4)), 1fr));
		gap: var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.legend li {
		display: flex;
		align-items: start;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.legend li.previous {
		opacity: 0.7;
	}
	.legend-text {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.legend .mark {
		flex: none;
	}
	.ground {
		display: grid;
		gap: var(--space-6);
		padding: var(--space-6);
		border-radius: var(--radius-panel);
		min-inline-size: 0;
	}
	.ground.light {
		background: var(--surface-sunken);
	}
	.ground.dark {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	figure {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		min-inline-size: 0;
	}
	figcaption {
		color: inherit;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-6);
		min-inline-size: 0;
	}
	.cell {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.cell.solo {
		inline-size: max(min(var(--size), 100%), var(--space-16));
	}
	.set {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.size {
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.mark {
		display: block;
		flex: none;
		inline-size: var(--size);
		aspect-ratio: 1;
		overflow: hidden;
	}
	.solo .mark {
		inline-size: min(var(--size), 100%);
	}
	.mark img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
	}
	.circle {
		border-radius: var(--radius-round);
	}
	.squircle,
	.maskable-squircle {
		border-radius: var(--radius-frame);
		background: var(--accent);
	}
	.maskable {
		border-radius: var(--radius-round);
		background: var(--accent);
	}
	.inset {
		scale: 0.8;
	}
	.grey {
		filter: grayscale(1);
	}
</style>
