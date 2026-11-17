<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';
	import { link } from './data.ts';
	import { hideOnType } from '#lib/components/scroll-cue/cue.ts';

	let { current = null, worst = false, specimen = false }: { current?: 'home' | 'folders' | 'search' | null; worst?: boolean; specimen?: boolean } = $props();
	const tabs: { slug: string; key: 'home' | 'folders' | 'search'; label: string; icon: IconName }[] = [
		{ slug: 'home', key: 'home', label: 'Home', icon: 'home' },
		{ slug: 'folders', key: 'folders', label: 'Folders', icon: 'folder' },
		{ slug: 'search', key: 'search', label: 'Search', icon: 'search' }
	];
</script>

<nav class="dock" aria-label="Main tabs" data-specimen={specimen || undefined} use:hideOnType>
	<ul class="dock-tabs" data-pill>
		{#each tabs as t (t.key)}
			<li>
				<a href={link(t.slug, worst)} aria-current={current === t.key ? 'page' : undefined} data-press><Icon name={t.icon} size={20} /><span>{t.label}</span></a>
			</li>
		{/each}
	</ul>
	<button type="button" class="dock-add" aria-label="New note" aria-haspopup="dialog" data-press="round" data-focus="halo"><Icon name="plus" size={24} /></button>
</nav>
