## ADDED Requirements

### Requirement: Preview cards in the editor
Pasting a URL alone into an empty paragraph SHALL turn it into a link preview card (title, description, site name, image when present); a URL inside a sentence SHALL stay an inline link; undo right after the paste SHALL turn the card back into a plain link; an invalid URL SHALL stay plain text; when no preview can be fetched the card SHALL show only the domain and URL.

#### Scenario: Pasting a URL alone makes a preview card
- **WHEN** `https://garden.example/` (fake remote page with og:title "Garden Notes", og:description, og:site_name "Garden" and og:image) is pasted into an empty paragraph
- **THEN** a card shows "Garden Notes", the description, "Garden" and an image from `/images/<id>`, and the stored content holds a `linkPreview` node with those attributes
- **proof:** e2e

#### Scenario: URL inside a sentence stays an inline link
- **WHEN** `https://garden.example/` is pasted after "Siehe " in a paragraph
- **THEN** the paragraph reads "Siehe https://garden.example/" with the URL as a link and no card is created
- **proof:** e2e

#### Scenario: Undo turns the card back into a link
- **WHEN** a URL is pasted alone, the card appears, and Cmd/Ctrl+Z is pressed once
- **THEN** the card is gone and the paragraph holds the URL as a link
- **proof:** e2e

#### Scenario: Invalid URL stays plain text
- **WHEN** `htp:/kaputt` is pasted alone into an empty paragraph
- **THEN** the paragraph holds that text without a link and no card is created
- **proof:** e2e

#### Scenario: Failed preview shows domain and URL only
- **WHEN** `https://blocked.example/page` (fake remote answers 403) is pasted alone
- **THEN** a card shows "blocked.example" and the URL, with no title, description or image
- **proof:** e2e

#### Scenario: Private address gives a domain-only card
- **WHEN** `http://192.168.1.10/admin` is pasted alone
- **THEN** a card shows "192.168.1.10" and the URL, with no title, description or image
- **proof:** e2e

### Requirement: Preview fetch on the server
`POST /api/preview` SHALL fetch only http and https URLs whose host doesn't resolve to a private, loopback, link-local or CGNAT address — checked before connecting and again on each of at most 3 redirects — with a 5 s timeout, a 1 MB page cap and `text/html` only; it SHALL read og:title, og:description, og:site_name and og:image with `<title>` as fallback, store the preview image as WebP owned by the note (long side ≤ 1600 px), never hotlink it, and answer the domain and URL only when anything fails.

#### Scenario: Only http and https URLs are fetched
- **WHEN** `safeFetch` is called with `ftp://`, `file://` and `javascript:` URLs
- **THEN** each fails with `FetchError('invalid-url')` without a connection
- **proof:** unit

#### Scenario: Private addresses are refused
- **WHEN** `safeFetch` is called with `http://127.0.0.1/`, `http://10.0.0.5/`, `http://192.168.1.10/`, `http://169.254.169.254/`, `http://100.64.0.1/` and `http://[::1]/`
- **THEN** each fails with `FetchError('private-address')` without a connection
- **proof:** unit

#### Scenario: Hostname resolving to a private address is refused
- **WHEN** the injected lookup resolves `intranet.example` to `10.1.2.3`
- **THEN** `safeFetch` fails with `FetchError('private-address')` without a connection
- **proof:** unit

#### Scenario: Redirect to a private address is refused
- **WHEN** a public test server answers 302 to `http://127.0.0.1/secret`
- **THEN** `safeFetch` fails with `FetchError('private-address')` and the redirect target is never requested
- **proof:** unit

#### Scenario: Slow page times out
- **WHEN** a test server holds the response longer than the timeout
- **THEN** `safeFetch` fails with `FetchError('timeout')` after the timeout (5 s by default)
- **proof:** unit

#### Scenario: Non-HTML page gives no preview
- **WHEN** the URL answers `application/pdf`
- **THEN** `readPreview` returns the domain and URL with title, description, site name and image all null
- **proof:** unit

#### Scenario: Oversized page is cut at 1 MB
- **WHEN** a page is 3 MB with its og tags in the first kilobyte
- **THEN** only the first 1 MB is read and the og tags are still found
- **proof:** unit

#### Scenario: Open Graph tags fill the preview
- **WHEN** `parsePreview` reads a page with og:title, og:description, og:site_name and a relative og:image
- **THEN** it returns those values with entities decoded and the image URL resolved against the page URL
- **proof:** unit

#### Scenario: Page without Open Graph falls back to its title
- **WHEN** `parsePreview` reads a page with only `<title>Plain Page</title>`
- **THEN** the title is "Plain Page" and description, site name and image are null
- **proof:** unit

#### Scenario: Preview image is stored and never hotlinked
- **WHEN** `readPreview(url, noteId)` reads a page whose og:image is reachable
- **THEN** the image is stored as WebP owned by the note with the long side at most 1600 px and the result's `imageId` points at it, holding no remote image URL
- **proof:** unit

#### Scenario: Previewing a real site
- **WHEN** Rue pastes a real article URL into a note on the dev server
- **THEN** a card with the site's title, description and image appears
- **proof:** manual (live network; every automated test uses the fake remote)
