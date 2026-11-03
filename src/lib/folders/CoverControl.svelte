<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	const MAX_BYTES = 16 * 1024 * 1024;

	let { folderId, hasCover }: { folderId: Id; hasCover: boolean } = $props();

	async function choose(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		input.value = '';
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

<div class="control" class:on-cover={hasCover}>
	<label class="chip glass" class:icon={hasCover}>
		<input type="file" accept="image/*" aria-label={hasCover ? 'Change cover' : 'Add cover'} onchange={choose} />
		<Icon name="image" />
		{#if !hasCover}<span>Add cover</span>{/if}
	</label>
	{#if hasCover}
		<button type="button" class="chip glass icon" aria-label="Remove cover" onclick={remove}><Icon name="trash" /></button>
	{/if}
</div>

<style>
	.control {
		display: flex;
		gap: var(--s-2);
	}

	.on-cover {
		position: absolute;
		inset-block-start: var(--s-4);
		inset-inline-end: var(--s-4);
	}

	.chip {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		block-size: var(--control);
		padding: 0 var(--s-4);
		border: 0;
		border-radius: var(--r-pill);
		color: var(--ink);
		cursor: pointer;
		font: inherit;
		font-size: var(--t-small);
		font-weight: 600;
		transition: transform var(--d-fast) var(--ease-out);
	}

	.icon {
		inline-size: var(--control);
		padding: 0;
	}

	.chip:active {
		transform: scale(0.96);
	}

	.chip:focus-within,
	.chip:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	input {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		opacity: 0;
		cursor: pointer;
	}
</style>
