import { isIP } from 'node:net';
import { FetchError, UploadError } from '#lib/errors.ts';
import type { Id, LinkPreview } from '#lib/types.ts';
import { storeImage } from './images.ts';
import { isBlockedAddress } from './net.ts';
import { getRemote } from './remote.ts';

export interface PagePreview {
	title: string | null;
	description: string | null;
	siteName: string | null;
	imageUrl: string | null;
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s: string): string {
	return s.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (whole, dec, hex, name) => {
		if (name) return NAMED[name.toLowerCase()] ?? whole;
		const code = dec ? Number(dec) : parseInt(hex, 16);
		return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
	});
}

// quoted values may contain ">"
const META = /<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;

function attributes(tag: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	for (const m of tag.matchAll(/([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
		attrs[m[1].toLowerCase()] ??= decode(m[2] ?? m[3] ?? m[4]);
	}
	return attrs;
}

function webUrl(raw: string | undefined, base: string): string | null {
	if (!raw?.trim()) return null;
	try {
		const url = new URL(raw.trim(), base);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

function text(raw: string | undefined): string | null {
	return raw?.replace(/\s+/g, ' ').trim() || null;
}

export function parsePreview(html: string, pageUrl: string): PagePreview {
	const meta: Record<string, string> = {};
	for (const tag of html.match(META) ?? []) {
		const a = attributes(tag);
		const key = (a.property ?? a.name)?.toLowerCase();
		if (key && a.content !== undefined) meta[key] ??= a.content;
	}
	const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
	return {
		title: text(meta['og:title']) ?? text(title && decode(title)),
		description: text(meta['og:description']),
		siteName: text(meta['og:site_name']),
		imageUrl: webUrl(meta['og:image'], pageUrl)
	};
}

// the real remote guards this too, the fake doesn't, and the guard has to hold with either
function privateHost(host: string): boolean {
	const h = host.replace(/^\[|\]$/g, '').toLowerCase();
	return h === 'localhost' || h.endsWith('.localhost') || (isIP(h) !== 0 && isBlockedAddress(h));
}

// a page or image that can't be had gives the domain and URL only; only an unusable URL throws
export async function readPreview(url: string, noteId: Id): Promise<LinkPreview> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new FetchError('invalid-url');
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new FetchError('invalid-url');
	const bare: LinkPreview = {
		url,
		domain: parsed.hostname.replace(/^www\./, ''),
		title: null,
		description: null,
		siteName: null,
		imageId: null
	};
	if (privateHost(parsed.hostname)) return bare;
	const remote = getRemote();
	let page: { url: string; html: string };
	try {
		page = await remote.fetchPage(url);
	} catch (e) {
		if (e instanceof FetchError || e instanceof UploadError) return bare;
		throw e;
	}
	const { imageUrl, ...text } = parsePreview(page.html, page.url);
	let imageId: Id | null = null;
	if (imageUrl) {
		try {
			imageId = (await storeImage(await remote.fetchImage(imageUrl), { noteId }, 1600)).id;
		} catch (e) {
			if (!(e instanceof FetchError || e instanceof UploadError)) throw e;
		}
	}
	return { ...bare, ...text, imageId };
}
