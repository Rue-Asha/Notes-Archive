import { error } from '@sveltejs/kit';
import { getFile } from '#lib/server/files.ts';
import type { RequestHandler } from './$types';

// types a browser displays without running anything of the author's; everything else is a download
const INLINE = new Set([
	'application/pdf',
	'text/plain',
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'audio/mpeg',
	'audio/ogg',
	'video/mp4',
	'video/webm'
]);

export const GET: RequestHandler = ({ params, url }) => {
	const file = /^\d+$/.test(params.id) ? getFile(Number(params.id)) : null;
	if (!file) error(404, 'Not found');
	const inline = INLINE.has(file.mime) && !url.searchParams.has('download');
	const encoded = encodeURIComponent(file.name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
	const plain = file.name.replace(/[^\x20-\x7e]|["\\]/g, '_');
	return new Response(file.bytes as Uint8Array<ArrayBuffer>, {
		headers: {
			'content-type': file.mime,
			'content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${plain}"; filename*=UTF-8''${encoded}`,
			'x-content-type-options': 'nosniff',
			'content-security-policy': 'sandbox'
		}
	});
};
