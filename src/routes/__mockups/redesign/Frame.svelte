<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { MockTag } from './fixtures.ts';
	import './hifi/tree/shell.css';
	import HifiDock from './hifi/tree/Dock.svelte';
	import HifiSideTree from './hifi/tree/SideTree.svelte';
	import PhoneBar from './wire/tree/PhoneBar.svelte';
	import SideTree from './wire/tree/SideTree.svelte';
	import { dataFor, viewFor, type TreeView } from './wire/tree/data.ts';
	import { link } from './hifi/tree/data.ts';

	type Section = 'home' | 'folders' | 'search' | null;
	type Props = {
		nav?: Snippet;
		children: Snippet;
		posture?: 'auto';
		view?: TreeView;
		current?: Section;
		rail?: boolean;
		tags?: MockTag[];
		look?: 'wire' | 'hifi';
		tag?: boolean;
	};
	let { nav, children, posture, view, current, rail = false, tags, look, tag = false }: Props = $props();

	const hifi = $derived((look ?? (page.url.pathname.includes('/hifi/') ? 'hifi' : 'wire')) === 'hifi');

	const data = $derived(dataFor(page.url));
	const screen = $derived((page.url.pathname.split(hifi ? '/hifi/' : '/wire/')[1] ?? '').split('/')[0]);
	const section = $derived<Section>(current !== undefined ? current : screen === 'home' ? 'home' : screen === 'folders' || screen === 'folder' ? 'folders' : screen === 'search' ? 'search' : null);
	const shown = $derived(view ?? viewFor(data, hifi && screen === 'editor' ? 'note' : screen));
	const tabs = [
		{ slug: 'home', key: 'home', label: 'Home' },
		{ slug: 'folders', key: 'folders', label: 'Folders' },
		{ slug: 'search', key: 'search', label: 'Search' }
	] as const;
	/* svelte-ignore state_referenced_locally */
	let folded = $state(rail);
</script>

{#if hifi}
	<div class="app" data-backdrop="field" data-posture={posture} data-data={data.worst ? 'worst' : 'normal'} style:--photo={'url("/__mockups/photo/lake-greek.jpg")'}>
		<div class="frame hf-frame" data-rail={folded || undefined}>
			<header class="app-bar">
				<a class="brand" href="/__mockups/redesign"><span class="brand-mark" aria-hidden="true">N</span><span class="brand-name">Notes Archive</span></a>
				<nav class="app-nav" aria-label="Main">
					<ul>
						{#each tabs as t (t.key)}
							<li><a href={link(t.slug, data.worst)} aria-current={section === t.key ? 'page' : undefined}>{t.label}</a></li>
						{/each}
					</ul>
				</nav>
			</header>
			<div class="hf-side">
				<HifiSideTree view={shown} tags={tags ?? data.tags} sort={data.sort} worst={data.worst} bind:rail={folded} current={section} {tag} />
			</div>
			<main class="screen hf-screen" id="main">
				{@render children()}
			</main>
		</div>
		<HifiDock current={section} worst={data.worst} />
	</div>
{:else}
	<div class="app wire" data-posture={posture} data-data={data.worst ? 'worst' : 'normal'}>
		<div class="frame wire-frame">
			{#if nav}
				<header class="app-bar">
					<a class="brand" href="/__mockups/redesign"><span class="brand-mark" aria-hidden="true">N</span><span class="brand-name">Notes Archive</span></a>
					<nav class="app-nav" aria-label="Main">{@render nav()}</nav>
				</header>
			{/if}
			<div class="side-slot" data-rail={folded || undefined}>
				<SideTree view={shown} tags={tags ?? data.tags} sort={data.sort} worst={data.worst} bind:rail={folded} current={section} />
			</div>
			<main class="screen">
				<div class="screen-body">
					{@render children()}
				</div>
			</main>
			<div class="bar-slot">
				<PhoneBar current={section} worst={data.worst} />
			</div>
		</div>
	</div>
{/if}

<style>
	.app.wire {
		padding: var(--space-2);
	}
	.app.wire::before {
		background: var(--surface-page);
		filter: none;
	}
	.app.wire::after {
		content: none;
	}
	.wire-frame {
		--pad-block: var(--space-3);
		--pad-inline: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-block-size: calc(100dvh - 2 * var(--space-2));
		padding: var(--pad-block) var(--pad-inline) var(--space-3);
		border-radius: var(--radius-frame-compact);
		background: var(--surface-sunken);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
		box-shadow: none;
	}
	.app-bar {
		order: -1;
	}
	.side-slot {
		display: none;
	}
	.screen {
		display: block;
		flex: 1;
		min-inline-size: 0;
	}
	.bar-slot {
		display: block;
	}
	@media (min-width: 1024px) {
		.app.wire {
			padding: var(--space-frame-block) var(--space-frame-inline);
		}
		.wire-frame {
			--pad-block: var(--space-4);
			--pad-inline: var(--space-4);
			display: grid;
			grid-template-columns: 17.5rem minmax(0, 1fr);
			grid-template-rows: auto 1fr;
			align-items: start;
			column-gap: var(--space-6);
			min-block-size: auto;
			padding: var(--pad-block);
			border-radius: var(--radius-frame);
		}
		.app-bar {
			grid-column: 1 / -1;
		}
		.side-slot {
			display: block;
			position: sticky;
			inset-block-start: var(--space-4);
			grid-row: 2;
			grid-column: 1;
			block-size: calc(100dvh - 2 * var(--space-frame-block) - 2 * var(--space-4));
			min-block-size: 30rem;
		}
		.side-slot[data-rail] {
			inline-size: var(--rail-width);
		}
		.wire-frame:has(.side-slot[data-rail]) {
			grid-template-columns: var(--rail-width) minmax(0, 1fr);
		}
		.screen {
			grid-row: 2;
			grid-column: 2;
			padding-block: var(--space-2);
		}
		.bar-slot {
			display: none;
		}
	}

	.hf-frame {
		--pad-block: var(--space-3-5);
		--pad-inline: var(--space-3-5);
		--gutter: var(--space-3-5);
		--side-w: 17.5rem;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-block-size: calc(100dvh - 2 * var(--space-2));
		padding: var(--pad-block) var(--pad-inline) var(--space-4);
	}
	/* below the wide layout a pointer can be a finger: every control keeps a 44px box */
	@media (max-width: 1099px) {
		.hf-frame {
			--target: var(--target-touch);
			--control-height-xs: var(--target-touch);
		}
	}
	.hf-frame .app-bar {
		display: none;
		order: -1;
	}
	.hf-side {
		display: none;
	}
	.hf-screen {
		display: block;
		flex: 1;
		min-inline-size: 0;
	}
	.hf-screen :global(.screen-head) {
		padding-block: var(--space-2) var(--space-4);
	}
	.hf-screen :global(.screen-head),
	.hf-screen :global(.screen-body) {
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
	}
	@media (min-width: 1024px) {
		.hf-frame {
			display: grid;
			grid-template-columns: [side-start] var(--side-w) [side-end main-start] minmax(0, 1fr) [main-end];
			grid-template-rows: auto 1fr;
			align-items: start;
			min-block-size: calc(100dvh - 2 * var(--space-frame-block));
			padding: var(--pad-block) var(--pad-inline);
		}
		.hf-frame[data-rail] {
			--side-w: var(--rail-width);
		}
		.hf-side {
			display: block;
			position: sticky;
			inset-block-start: var(--space-3-5);
			grid-column: side;
			grid-row: 1 / span 2;
			block-size: calc(100dvh - 2 * var(--space-frame-block) - 2 * var(--space-3-5));
			min-block-size: 30rem;
		}
		.hf-screen {
			grid-column: main;
			grid-row: 1 / span 2;
			padding-inline-end: var(--space-2);
		}
	}
</style>
