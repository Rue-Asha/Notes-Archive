import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { FetchError, UploadError } from '#lib/errors.ts';
import { fakeRemote } from './fake/remote.ts';
import { createRemote, getRemote, safeRemote } from './remote.ts';

const ALLOW = ['127.0.0.2'];
const PNG = [0x89, 0x50, 0x4e, 0x47];
const servers: Server[] = [];

async function serve(handler: (req: IncomingMessage, res: ServerResponse) => void): Promise<string> {
	const server = createServer(handler);
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.2', resolve));
	return `http://127.0.0.2:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
	delete process.env.NOTES_ARCHIVE_TEST;
	await Promise.all(
		servers.splice(0).map(
			(s) =>
				new Promise<void>((resolve) => {
					s.close(() => resolve());
					s.closeAllConnections();
				})
		)
	);
});

async function code(p: Promise<unknown>): Promise<string> {
	const err = await p.then(
		() => null,
		(e: unknown) => e
	);
	if (err instanceof FetchError || err instanceof UploadError) return err.code;
	throw new Error(`expected a FetchError or UploadError, got ${String(err)}`);
}

describe('getRemote', () => {
	it('uses the fake in test mode and never in production', () => {
		expect(getRemote()).toBe(safeRemote);
		process.env.NOTES_ARCHIVE_TEST = '1';
		expect(getRemote()).toBe(fakeRemote);
	});
});

describe('fake remote', () => {
	it('serves the canned pages', async () => {
		const garden = await fakeRemote.fetchPage('https://garden.example/');
		expect(garden.url).toBe('https://garden.example/');
		expect(garden.html).toContain('<meta property="og:title" content="Garden Notes">');
		expect(garden.html).toContain('og:description');
		expect(garden.html).toContain('<meta property="og:site_name" content="Garden">');
		expect(garden.html).toContain('<meta property="og:image" content="/__test/image/garden.png">');
		expect((await fakeRemote.fetchPage('https://plain.example/')).html).toContain('<title>Plain Page</title>');
	});

	it('generates images for /__test/image/ URLs only', async () => {
		const image = await fakeRemote.fetchImage('https://garden.example/__test/image/garden.png');
		expect([...image.slice(0, 4)]).toEqual(PNG);
		expect(await code(fakeRemote.fetchImage('https://cdn.example/cover.jpg'))).toBe('not-image');
	});

	it('fails like the safe fetch would', async () => {
		expect(await code(fakeRemote.fetchPage('https://pdf.example/doc.pdf'))).toBe('not-html');
		expect(await code(fakeRemote.fetchPage('https://blocked.example/page'))).toBe('status');
		expect(await code(fakeRemote.fetchPage('http://127.0.0.1/'))).toBe('private-address');
		expect(await code(fakeRemote.fetchPage('https://unknown.example/'))).toBe('network');
		expect(await code(fakeRemote.fetchPage('ftp://garden.example/'))).toBe('invalid-url');
		expect(await code(fakeRemote.fetchPage('not a url'))).toBe('invalid-url');
	});
});

describe('safeRemote', () => {
	const remote = createRemote({ allowAddresses: ALLOW });

	it('fetches a page as text and truncates it at 1 MB', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			res.end('<title>Ä</title>' + 'a'.repeat(2 * 1024 * 1024));
		});

		const page = await remote.fetchPage(`${base}/p`);

		expect(page.url).toBe(`${base}/p`);
		expect(page.html.startsWith('<title>Ä</title>')).toBe(true);
		expect(Buffer.byteLength(page.html)).toBe(1024 * 1024);
	});

	it('sends the Notes-Archive user agent', async () => {
		let agent = '';
		const base = await serve((req, res) => {
			agent = String(req.headers['user-agent']);
			res.writeHead(200, { 'content-type': 'text/html' });
			res.end('<title>x</title>');
		});

		await remote.fetchPage(`${base}/`);

		expect(agent).toMatch(/^Notes-Archive\/\d+\.\d+\.\d+ \(private archive\)$/);
	});

	it('refuses a page that is not text/html', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'application/pdf' });
			res.end('%PDF');
		});

		expect(await code(remote.fetchPage(`${base}/`))).toBe('not-html');
	});

	it('refuses a page with an error status', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(403, { 'content-type': 'text/html' });
			res.end('<title>no</title>');
		});

		expect(await code(remote.fetchPage(`${base}/`))).toBe('status');
	});

	it('fetches an image and refuses other content types', async () => {
		const base = await serve((req, res) => {
			res.writeHead(200, { 'content-type': req.url === '/a.png' ? 'image/png' : 'text/html' });
			res.end(Buffer.from([1, 2, 3]));
		});

		expect([...(await remote.fetchImage(`${base}/a.png`))]).toEqual([1, 2, 3]);
		expect(await code(remote.fetchImage(`${base}/page`))).toBe('not-image');
	});

	it('fails an image over 16 MB as too-large', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'image/png' });
			res.end(Buffer.alloc(16 * 1024 * 1024 + 1));
		});

		expect(await code(remote.fetchImage(`${base}/big.png`))).toBe('too-large');
	});

	it('refuses private addresses with the real remote', async () => {
		expect(await code(createRemote().fetchPage('http://127.0.0.1/'))).toBe('private-address');
	});
});
