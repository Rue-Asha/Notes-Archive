<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '#lib/components/button/Button.svelte';
	import { COPY } from '#lib/copy.ts';
	import { toast } from '#lib/shell/toast.ts';
	import Icon from '#lib/shell/tree/Icon.svelte';
	import type { Id } from '#lib/types.ts';
	import Menu from '#lib/ui/Menu.svelte';

	const MAX_BYTES = 16 * 1024 * 1024;

	let { folderId, hasCover }: { folderId: Id; hasCover: boolean } = $props();

	let input = $state<HTMLInputElement>();
	let anchor = $state<HTMLElement | null>(null);
	let open = $state(false);

	const items = $derived([
		{ label: 'Change cover', icon: 'image', onselect: () => input?.click() },
		{ label: 'Remove cover', icon: 'trash', danger: true, onselect: remove }
	]);

	async function choose(event: Event & { currentTarget: HTMLInputElement }) {
		const field = event.currentTarget;
		const file = field.files?.[0];
		field.value = '';
		if (!file) return;
		if (!file.type.startsWith('image/')) return toast(COPY.notAnImage, 'error');
		if (file.size > MAX_BYTES) return toast(COPY.imageTooLarge, 'error');
		const res = await fetch(`/api/folders/${folderId}/cover`, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
		if (!res.ok) return toast(res.status === 415 ? COPY.notAnImage : res.status === 413 ? COPY.imageTooLarge : COPY.uploadFailed, 'error');
		await invalidateAll();
	}

	async function remove() {
		const res = await fetch(`/api/folders/${folderId}/cover`, { method: 'DELETE' });
		if (!res.ok) return toast(COPY.uploadFailed, 'error');
		await invalidateAll();
	}
</script>

<input bind:this={input} type="file" accept="image/*" hidden aria-label={hasCover ? 'Change cover' : 'Add cover'} onchange={choose} />
<span class="host" bind:this={anchor}>
	{#if hasCover}
		<Button variant="glass" size="s" aria-haspopup="menu" aria-expanded={open} onclick={() => (open = !open)}><Icon name="image" size={16} /><span>Change cover</span></Button>
	{:else}
		<Button variant="glass" size="s" onclick={() => input?.click()}><Icon name="image" size={16} /><span>Add cover</span></Button>
	{/if}
</span>
<Menu {open} {anchor} label="Cover" {items} onclose={() => (open = false)} />

<style>
	.host {
		display: inline-flex;
		min-inline-size: 0;
	}
</style>
