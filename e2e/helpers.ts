import { resolve } from 'node:path';
import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import type { Id } from '../src/lib/types.ts';
import type { SeedInput, SeedResult, StoredNote } from '../src/lib/server/testing.ts';

export type { SeedInput, SeedResult, StoredNote };

// A POST without a content type counts as a form post, which SvelteKit's CSRF check rejects.
export async function reset(request: APIRequestContext): Promise<void> {
	const res = await request.post('/__test/reset', { data: {} });
	if (!res.ok()) throw new Error(`reset failed: ${res.status()}`);
}

export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult> {
	const res = await request.post('/__test/seed', { data: input });
	if (!res.ok()) throw new Error(`seed failed: ${res.status()} ${await res.text()}`);
	return (await res.json()) as SeedResult;
}

export async function counts(
	request: APIRequestContext
): Promise<Record<'notes' | 'folders' | 'tags' | 'note_tags' | 'images' | 'files' | 'notes_fts', number>> {
	const res = await request.get('/__test/counts');
	if (!res.ok()) throw new Error(`counts failed: ${res.status()}`);
	return await res.json();
}

export async function storedNote(request: APIRequestContext, id: Id): Promise<StoredNote | null> {
	const res = await request.get(`/__test/note/${id}`);
	if (res.status() === 404) return null;
	if (!res.ok()) throw new Error(`storedNote failed: ${res.status()}`);
	return (await res.json()) as StoredNote;
}

// Input that lands on the server-rendered page before hydration is silently lost.
export async function open(page: Page, path: string): Promise<void> {
	await page.goto(path);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

// the note body carries the label "Note body"; it is the ProseMirror editable root
export const editor = (page: Page): Locator => page.getByLabel('Note body', { exact: true });

export const calm = (page: Page): Promise<void> => page.emulateMedia({ reducedMotion: 'reduce' });

export const photo = (name: string): string => resolve('fixtures/mockups', name);

// Writes queue up behind the one in flight, so a reload before the last response lands drops the rest.
// Call before opening the page; await settled() before every reload.
export function watchSaves(page: Page): { settled(): Promise<void> } {
	let inFlight = 0;
	page.on('request', (req) => {
		if (new URL(req.url()).pathname.startsWith('/api/notes')) inFlight++;
	});
	const done = (req: { url(): string }) => {
		if (new URL(req.url()).pathname.startsWith('/api/notes')) inFlight--;
	};
	page.on('requestfinished', done);
	page.on('requestfailed', done);
	return {
		async settled() {
			await expect.poll(() => inFlight).toBe(0);
			const state = page.locator('[data-save-state]');
			if (await state.count()) await expect(state).not.toHaveAttribute('data-save-state', /^(pending|saving)$/);
		}
	};
}

// Leaves a page that has no shell yet: an <a href> inside the app root, clicked, so Kit's router handles it.
export async function clientNav(page: Page, path: string): Promise<void> {
	await page.evaluate((href) => {
		const a = document.createElement('a');
		a.href = href;
		document.body.append(a);
		a.click();
		a.remove();
	}, path);
	await page.waitForURL((url) => url.pathname + url.search === path);
}
