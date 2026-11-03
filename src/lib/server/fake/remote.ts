import { FetchError, UploadError } from '#lib/errors.ts';
import { htmlPage } from '../page.ts';
import type { Remote } from '../remote.ts';
import { FAKE_PAGES, fakeImage } from './pages.ts';

function parse(url: string): URL {
	try {
		return new URL(url);
	} catch {
		throw new FetchError('invalid-url');
	}
}

export const fakeRemote: Remote = {
	async fetchPage(url) {
		const u = parse(url);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new FetchError('invalid-url');
		if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') throw new FetchError('private-address');
		if (u.hostname === 'blocked.example') throw new FetchError('status');
		if (u.hostname === 'pdf.example') return htmlPage({ url: u.href, status: 200, contentType: 'application/pdf', body: new TextEncoder().encode('%PDF-1.4 <title>Mietvertrag</title>') });
		const html = FAKE_PAGES[u.href];
		if (html === undefined) throw new FetchError('network');
		return { url: u.href, html };
	},
	async fetchImage(url) {
		const { pathname } = new URL(url, 'http://fake.invalid');
		if (!pathname.startsWith('/__test/image/')) throw new UploadError('not-image');
		return fakeImage(pathname.slice('/__test/image/'.length));
	}
};
