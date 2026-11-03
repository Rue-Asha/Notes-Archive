import pkg from '../../../package.json' with { type: 'json' };
import { FetchError, UploadError } from '#lib/errors.ts';
import { fakeRemote } from './fake/remote.ts';
import { MAX_UPLOAD_BYTES } from './images.ts';
import { safeFetch, type SafeFetchOptions } from './net.ts';
import { htmlPage } from './page.ts';
import { testFlag } from './test-flag.ts';

export interface Remote {
	fetchPage(url: string): Promise<{ url: string; html: string }>;
	fetchImage(url: string): Promise<Uint8Array>;
}

export const USER_AGENT = `Notes-Archive/${pkg.version} (private archive)`;
export const MAX_PAGE_BYTES = 1024 * 1024;

export function createRemote(extra: Pick<SafeFetchOptions, 'allowAddresses' | 'lookup' | 'timeoutMs'> = {}): Remote {
	const headers = { 'user-agent': USER_AGENT };
	return {
		async fetchPage(url) {
			return htmlPage(await safeFetch(url, { ...extra, headers, maxBytes: MAX_PAGE_BYTES, truncate: true }));
		},
		// throws FetchError, or UploadError('not-image') for a non-image answer
		async fetchImage(url) {
			const res = await safeFetch(url, { ...extra, headers, maxBytes: MAX_UPLOAD_BYTES });
			if (res.status < 200 || res.status >= 300) throw new FetchError('status');
			if (!res.contentType?.toLowerCase().startsWith('image/')) throw new UploadError('not-image');
			return res.body;
		}
	};
}

export const safeRemote: Remote = createRemote();

export function getRemote(): Remote {
	return testFlag() ? fakeRemote : safeRemote;
}
