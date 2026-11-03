import { FetchError } from '#lib/errors.ts';
import type { SafeResponse } from './net.ts';

function charsetOf(contentType: string): string {
	return /charset=["']?([\w-]+)/i.exec(contentType)?.[1] ?? 'utf-8';
}

function decode(bytes: Uint8Array, contentType: string): string {
	try {
		return new TextDecoder(charsetOf(contentType)).decode(bytes);
	} catch {
		return new TextDecoder().decode(bytes);
	}
}

// throws FetchError: 'status' for a non-2xx answer, 'not-html' for anything but text/html
export function htmlPage(res: SafeResponse): { url: string; html: string } {
	if (res.status < 200 || res.status >= 300) throw new FetchError('status');
	const type = res.contentType ?? '';
	if (!/^text\/html\b/i.test(type)) throw new FetchError('not-html');
	return { url: res.url, html: decode(res.body, type) };
}
