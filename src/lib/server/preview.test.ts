import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchError, UploadError } from '#lib/errors.ts';
import { getDb } from './db.ts';
import { fakeRemote } from './fake/remote.ts';
import { getImage } from './images.ts';
import { parsePreview, readPreview } from './preview.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
	process.env.NOTES_ARCHIVE_TEST = '1';
});
afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.NOTES_ARCHIVE_TEST;
});

describe('parsePreview', () => {
	it('Scenario: Open Graph tags fill the preview', () => {
		const html = `<html><head>
			<title>Ignored | Home</title>
			<meta property="og:title" content="Garden &amp; Fils &#8211; &quot;Notes&quot;">
			<meta content='Seeds &lt;3 &#x27;soil&#x27;' property='og:description'>
			<meta property="og:site_name" content="Garden">
			<meta property="og:image" content="/img/hero.jpg">
		</head></html>`;

		expect(parsePreview(html, 'https://garden.example/a/b')).toEqual({
			title: 'Garden & Fils – "Notes"',
			description: "Seeds <3 'soil'",
			siteName: 'Garden',
			imageUrl: 'https://garden.example/img/hero.jpg'
		});
	});

	it('Scenario: Page without Open Graph falls back to its title', () => {
		const html = `<head><title>
			Plain Page
		</title></head>`;

		expect(parsePreview(html, 'https://plain.example/')).toEqual({
			title: 'Plain Page',
			description: null,
			siteName: null,
			imageUrl: null
		});
	});

	it('resolves a relative og:image against the page URL', () => {
		const html = '<meta property="og:image" content="../img/x.jpg">';

		expect(parsePreview(html, 'https://garden.example/a/b/').imageUrl).toBe('https://garden.example/a/img/x.jpg');
	});

	it('gives nulls for a page with nothing usable', () => {
		expect(parsePreview('<div id="root"></div>', 'https://app.example/')).toEqual({
			title: null,
			description: null,
			siteName: null,
			imageUrl: null
		});
	});

	it('ignores empty values and image URLs that are not http or https', () => {
		const html = `<meta property="og:title" content="  ">
			<meta property="og:image" content="javascript:alert(1)">
			<title>Real title</title>`;

		expect(parsePreview(html, 'https://a.example/')).toEqual({
			title: 'Real title',
			description: null,
			siteName: null,
			imageUrl: null
		});
	});

	it('keeps a ">" inside a quoted content value', () => {
		expect(parsePreview('<meta property="og:title" content="A > B">', 'https://a.example/').title).toBe('A > B');
	});
});

describe('readPreview', () => {
	const domainOnly = (url: string, domain: string) => ({
		url,
		domain,
		title: null,
		description: null,
		siteName: null,
		imageId: null
	});

	it('fills the card from the page and stores its image', async () => {
		const { notes } = seedArchive({ notes: [{}] });

		const preview = await readPreview('https://garden.example/', notes[0]);

		expect(preview).toMatchObject({
			url: 'https://garden.example/',
			domain: 'garden.example',
			title: 'Garden Notes',
			description: 'Seeds, soil & slow afternoons.',
			siteName: 'Garden'
		});
		expect(preview.imageId).toEqual(expect.any(Number));
	});

	it('Scenario: Preview image is stored and never hotlinked', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const big = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#c05030' } }).png().toBuffer();
		vi.spyOn(fakeRemote, 'fetchImage').mockResolvedValueOnce(big);

		const preview = await readPreview('https://garden.example/', notes[0]);

		const row = getDb().prepare('SELECT mime, width, height, note_id FROM images WHERE id = ?').get(preview.imageId!);
		expect(row).toMatchObject({ mime: 'image/webp', width: 1600, height: 533, note_id: notes[0] });
		expect(getImage(preview.imageId!)?.mime).toBe('image/webp');
		expect(JSON.stringify(preview)).not.toContain('garden.png');
	});

	it('Scenario: Non-HTML page gives no preview', async () => {
		const { notes } = seedArchive({ notes: [{}] });

		expect(await readPreview('https://pdf.example/doc.pdf', notes[0])).toEqual(
			domainOnly('https://pdf.example/doc.pdf', 'pdf.example')
		);
	});

	it('keeps the text and no image when the image download fails', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const download = vi.spyOn(fakeRemote, 'fetchImage');

		download.mockRejectedValueOnce(new FetchError('status'));
		expect(await readPreview('https://garden.example/', notes[0])).toMatchObject({ title: 'Garden Notes', imageId: null });

		download.mockRejectedValueOnce(new UploadError('not-image'));
		expect(await readPreview('https://garden.example/', notes[0])).toMatchObject({ title: 'Garden Notes', imageId: null });

		download.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
		expect(await readPreview('https://garden.example/', notes[0])).toMatchObject({ title: 'Garden Notes', imageId: null });
	});

	it('answers domain and URL only for a page without a preview', async () => {
		const { notes } = seedArchive({ notes: [{}] });

		expect(await readPreview('https://blocked.example/page', notes[0])).toEqual(
			domainOnly('https://blocked.example/page', 'blocked.example')
		);
		expect(await readPreview('https://unknown.example/', notes[0])).toEqual(
			domainOnly('https://unknown.example/', 'unknown.example')
		);
		expect(await readPreview('https://plain.example/', notes[0])).toMatchObject({ title: 'Plain Page', imageId: null });
	});

	it('refuses IP-literal private hosts before the remote is called', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const page = vi.spyOn(fakeRemote, 'fetchPage');

		expect(await readPreview('http://192.168.1.10/admin', notes[0])).toEqual(
			domainOnly('http://192.168.1.10/admin', '192.168.1.10')
		);
		expect(await readPreview('http://[::1]:8080/', notes[0])).toMatchObject({ title: null, imageId: null });
		expect(await readPreview('http://localhost/', notes[0])).toMatchObject({ title: null, imageId: null });
		expect(page).not.toHaveBeenCalled();
	});

	it('throws FetchError invalid-url for a URL that is not http or https', async () => {
		const { notes } = seedArchive({ notes: [{}] });

		await expect(readPreview('not a url', notes[0])).rejects.toMatchObject({ code: 'invalid-url' });
		await expect(readPreview('ftp://garden.example/', notes[0])).rejects.toMatchObject({ code: 'invalid-url' });
	});
});
