<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import Menu, { type MenuItem } from '#lib/components/menu/Menu.svelte';
	import { COPY } from '#lib/copy.ts';
	import { TREE_SORTS, type TreeSort } from '#lib/types.ts';
	import { pop } from '#lib/ui/motion.ts';
	import { portal } from '#lib/ui/overlay.ts';
	import { toast } from './toast.ts';

	let { placement, glass = false }: { placement: 'tree' | 'page'; glass?: boolean } = $props();

	let open = $state(false);
	let pending = $state<TreeSort | null>(null);
	let trigger: HTMLElement | undefined = $state();
	let popover: HTMLElement | undefined = $state();
	let spot = $state('');
	// only the latest choice's answer may settle the picker; an older one would wipe or revert a newer choice
	let latest = 0;
	// the choice whose answer settled the picker last
	let settled = 0;

	const mode = $derived(pending ?? (page.data.treeSort as TreeSort));
	const items = $derived(TREE_SORTS.map((m): MenuItem => ({ label: COPY.sortLabel[m], hint: COPY.sortHint[m], checked: m === mode })));

	// the popover sits on <body> (a glass ancestor would trap a fixed box); the tree opens it rightwards, the page leftwards
	function toggle() {
		if (open) return close();
		const rect = trigger!.getBoundingClientRect();
		const side = placement === 'tree' ? `inset-inline-start: ${rect.left}px` : `inset-inline-end: ${document.documentElement.clientWidth - rect.right}px`;
		// near the bottom of the screen (the Folders page puts it last) the menu opens upwards
		const room = innerHeight - rect.bottom;
		const up = room < 320 && rect.top > room;
		const origin = `transform-origin: ${up ? 'bottom' : 'top'} ${placement === 'tree' ? 'left' : 'right'}`;
		spot = `${up ? `inset-block-end: ${innerHeight - rect.top + 4}px` : `inset-block-start: ${rect.bottom + 4}px`}; ${side}; ${origin}`;
		open = true;
	}

	function close(refocus = false) {
		open = false;
		if (refocus) trigger?.querySelector('button')?.focus();
	}

	$effect(() => {
		if (open) popover?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
	});

	async function choose(item: MenuItem) {
		const next = TREE_SORTS.find((m) => COPY.sortLabel[m] === item.label)!;
		close(true);
		if (next === mode) return;
		pending = next;
		const mine = ++latest;
		const res = await fetch('/api/settings', {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ treeSort: next })
		}).catch(() => null);
		if (mine === latest) {
			settled = mine;
			if (!res?.ok) toast(COPY.saveFailed, 'error');
			// a failed latest reloads too: an older choice may have reached the server
			await invalidate('app:tree');
			// a choice made while that reload ran owns the picker now; clearing it would show the server's value until
			// the newer answer comes
			if (mine === latest) pending = null;
		} else if (res?.ok && settled === latest) {
			// an older choice landed after the latest one settled, so the server holds it now
			await invalidate('app:tree');
		}
	}
</script>

<svelte:window
	onpointerdown={(e) => open && !popover?.contains(e.target as Node) && !trigger?.contains(e.target as Node) && close()}
	onkeydown={(e) => open && e.key === 'Escape' && close(true)}
/>

<span class="host" bind:this={trigger}>
	<Button variant={glass ? 'glass' : 'quiet'} size="xs" icon label={COPY.sortMenu} aria-haspopup="menu" aria-expanded={open} onclick={toggle}>
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3" /></svg>
	</Button>
</span>

{#if open}
	<div class="popover" style={spot} bind:this={popover} use:portal in:pop out:pop>
		<Menu name={COPY.sortMenu} {items} radio onselect={choose} />
	</div>
{/if}

<style>
	.host {
		display: inline-flex;
	}

	.popover {
		position: fixed;
		/* above the sidebar and the phone bar, which stack at 20 and 30 until they are rebuilt on the fingerprint */
		z-index: var(--z-toast);
		inline-size: 19rem;
		max-inline-size: calc(100vw - var(--space-8));
	}
</style>
