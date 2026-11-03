import { testImage } from '../testing.ts';

// keyed by the URL's href; the og:image path is relative so the preview resolves it against the page
export const FAKE_PAGES: Record<string, string> = {
	'https://garden.example/': `<!doctype html><html><head>
<title>Garden Notes | Garden</title>
<meta property="og:title" content="Garden Notes">
<meta property="og:description" content="Seeds, soil &amp; slow afternoons.">
<meta property="og:site_name" content="Garden">
<meta property="og:image" content="/__test/image/garden.png">
</head><body><h1>Garden Notes</h1></body></html>`,
	'https://plain.example/': `<!doctype html><html><head>
<title>Plain Page</title>
</head><body><p>Nothing else here.</p></body></html>`
};

// a name picks the image, so two names give two different pictures
export function fakeImage(name: string): Uint8Array<ArrayBuffer> {
	return testImage([...name].reduce((sum, c) => sum + c.charCodeAt(0), 0));
}
