import { onMount } from 'svelte';

// false while a list renders for the first time (a page, an expanded folder), true from the next frame on: rows that
// arrive after that are the ones the user made, and only those move (motion.ts)
export function live(): { readonly on: boolean } {
	const state = $state({ on: false });
	onMount(() => {
		const frame = requestAnimationFrame(() => (state.on = true));
		return () => cancelAnimationFrame(frame);
	});
	return state;
}
