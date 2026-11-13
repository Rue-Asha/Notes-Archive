import type { Page } from '@playwright/test';
import sharp from 'sharp';
import { editor } from './helpers.ts';

export interface FileSpec {
	name: string;
	mime: string;
	// either real bytes or a zero-filled file of this size, built inside the page
	buffer?: Buffer;
	size?: number;
}

export const png = (width = 64, height = 48): Promise<Buffer> =>
	sharp({ create: { width, height, channels: 3, background: { r: 190, g: 120, b: 90 } } })
		.png()
		.toBuffer();

export const jpeg = (width = 64, height = 48): Promise<Buffer> =>
	sharp({ create: { width, height, channels: 3, background: { r: 90, g: 130, b: 160 } } })
		.jpeg()
		.toBuffer();

const wire = (files: FileSpec[]) =>
	files.map((f) => ({ name: f.name, mime: f.mime, b64: f.buffer?.toString('base64') ?? null, size: f.size ?? 0 }));

export async function pasteFiles(page: Page, files: FileSpec[]): Promise<void> {
	await editor(page).evaluate((el, items) => {
		const dt = new DataTransfer();
		for (const f of items) {
			const bytes = f.b64 ? Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0)) : new Uint8Array(f.size);
			dt.items.add(new File([bytes], f.name, { type: f.mime }));
		}
		el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
	}, wire(files));
}

export async function pasteText(page: Page, text: string): Promise<void> {
	await editor(page).evaluate((el, value) => {
		const dt = new DataTransfer();
		dt.setData('text/plain', value);
		el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
	}, text);
}

export interface Clip {
	html: string;
	text: string;
}

// a cut event carrying its own DataTransfer takes the path a real Ctrl+X takes: ProseMirror fills it and deletes the selection
export async function cutSelection(page: Page): Promise<Clip> {
	return editor(page).evaluate((el) => {
		const dt = new DataTransfer();
		el.dispatchEvent(new ClipboardEvent('cut', { clipboardData: dt, bubbles: true, cancelable: true }));
		return { html: dt.getData('text/html'), text: dt.getData('text/plain') };
	});
}

export async function pasteClip(page: Page, clip: Clip): Promise<void> {
	await editor(page).evaluate((el, value) => {
		const dt = new DataTransfer();
		dt.setData('text/html', value.html);
		dt.setData('text/plain', value.text);
		el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
	}, clip);
}

export async function dropFiles(page: Page, files: FileSpec[], at?: { x: number; y: number }): Promise<void> {
	const box = (await editor(page).boundingBox())!;
	await editor(page).evaluate(
		(el, args) => {
			const dt = new DataTransfer();
			for (const f of args.items) {
				const bytes = f.b64 ? Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0)) : new Uint8Array(f.size);
				dt.items.add(new File([bytes], f.name, { type: f.mime }));
			}
			const init = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: args.x, clientY: args.y };
			el.dispatchEvent(new DragEvent('dragover', init));
			el.dispatchEvent(new DragEvent('drop', init));
		},
		{ items: wire(files), x: at?.x ?? box.x + 40, y: at?.y ?? box.y + 20 }
	);
}
