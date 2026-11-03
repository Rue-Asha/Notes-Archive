<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import type { FolderDeleteCounts, TreeFolder } from '#lib/types.ts';
	import Dialog from '#lib/ui/Dialog.svelte';

	type Props = { folder: TreeFolder | null; inside: boolean; onclose(): void };

	let { folder, inside, onclose }: Props = $props();

	let counts = $state<FolderDeleteCounts | null>(null);
	// the text stays while the dialog fades out
	let shown = $state<TreeFolder | null>(null);

	$effect(() => {
		const target = folder;
		if (!target) return;
		shown = target;
		counts = null;
		fetch(`/api/folders/${target.id}`)
			.then((res) => res.json())
			.then((body) => {
				if (folder === target) counts = body.counts;
			});
	});

	async function confirm() {
		const target = folder!;
		const leave = inside;
		await fetch(`/api/folders/${target.id}`, { method: 'DELETE' });
		onclose();
		if (leave) await goto(target.parentId === null ? '/' : `/folders/${target.parentId}`);
		await invalidate('app:tree');
	}
</script>

<Dialog
	open={folder !== null && counts !== null}
	title="Delete folder"
	message={shown && counts ? COPY.deleteFolder(shown.name, counts) : ''}
	confirmLabel="Delete"
	danger
	onconfirm={confirm}
	oncancel={onclose}
/>
