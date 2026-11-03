<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import Menu from '#lib/ui/Menu.svelte';

	type Props = {
		open: boolean;
		anchor: HTMLElement | null;
		name: string;
		onnewnote(): void;
		onnewfolder(): void;
		onrename(): void;
		onmove(): void;
		ondelete(): void;
		onclose(): void;
	};

	let { open, anchor, name, onnewnote, onnewfolder, onrename, onmove, ondelete, onclose }: Props = $props();

	const items = $derived([
		{ label: COPY.newNote, icon: 'plus', onselect: onnewnote },
		{ label: COPY.newFolder, icon: 'folder', onselect: onnewfolder },
		{ label: 'Rename', icon: 'file', onselect: onrename },
		{ label: 'Move to…', icon: 'move', onselect: onmove },
		{ label: 'Delete', icon: 'trash', danger: true, onselect: ondelete }
	]);
</script>

<Menu {open} {anchor} label="{name} actions" {items} {onclose} />
