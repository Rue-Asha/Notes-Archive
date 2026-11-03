import { describe, expect, it } from 'vitest';
import { docFromText } from '#lib/editor/doc.ts';
import type { JSONContent } from '#lib/types.ts';
import { isEmptyDoc, plainText, referencedUploads, snippet } from './plaintext.ts';

const t = (text: string, marks?: JSONContent['marks']): JSONContent => ({ type: 'text', text, marks });
const p = (...content: JSONContent[]): JSONContent => ({ type: 'paragraph', content });
const doc = (...content: JSONContent[]): JSONContent => ({ type: 'doc', content });
const image = (id: number | null): JSONContent => ({ type: 'image', attrs: { id, width: 1, height: 1, caption: 'x' } });

describe('plainText', () => {
	it('Scenario: Plain text walker extracts block text', () => {
		const content = doc(
			{ type: 'heading', attrs: { level: 2 }, content: [t('Title')] },
			p(t('First '), t('bold', [{ type: 'bold' }]), { type: 'hardBreak' }, t('second line')),
			p(t('Third')),
			{
				type: 'bulletList',
				content: [
					{
						type: 'listItem',
						content: [p(t('Outer')), { type: 'bulletList', content: [{ type: 'listItem', content: [p(t('Inner'))] }] }]
					}
				]
			},
			{
				type: 'table',
				content: [
					{
						type: 'tableRow',
						content: [
							{ type: 'tableCell', content: [p(t('Cell A'))] },
							{ type: 'tableCell', content: [p(t('Cell B'))] }
						]
					}
				]
			},
			image(3)
		);

		expect(plainText(content)).toBe('Title\nFirst bold\nsecond line\nThird\nOuter\nInner\nCell A\nCell B');
	});

	it('Scenario: Unknown nodes still index', () => {
		const content = doc(p(t('Known')), { type: 'mysteryBlock', content: [t('Altes Format')] });

		expect(plainText(content)).toBe('Known\nAltes Format');
		expect(plainText(null)).toBe('');
		expect(plainText('text')).toBe('');
		expect(plainText({})).toBe('');
	});

	it('skips empty paragraphs and ignores node attributes', () => {
		expect(plainText(doc(p(), { type: 'image', attrs: { caption: 'hidden' } }, p(t('Hi'))))).toBe('Hi');
	});

	it('walks nodes nested inside unknown containers', () => {
		const content = doc({ type: 'mysteryBox', content: [{ type: 'mysteryBlock', content: [t('deep')] }, p(t('flat'))] });

		expect(plainText(content)).toBe('deep\nflat');
	});

	it('round-trips docFromText', () => {
		expect(plainText(docFromText('one\n\ntwo'))).toBe('one\ntwo');
	});
});

describe('snippet', () => {
	it('collapses whitespace', () => {
		expect(snippet('a \n b\t\tc')).toBe('a b c');
	});

	it('cuts at 240 characters', () => {
		expect(snippet('x'.repeat(300))).toHaveLength(240);
		expect(snippet('short')).toBe('short');
	});
});

describe('isEmptyDoc', () => {
	it('is empty without text and atoms', () => {
		expect(isEmptyDoc(doc(p()))).toBe(true);
		expect(isEmptyDoc(doc(p(t('  '))))).toBe(true);
		expect(isEmptyDoc(null)).toBe(true);
		expect(isEmptyDoc({})).toBe(true);
	});

	it('is not empty with text or an atom node', () => {
		expect(isEmptyDoc(doc(p(t('x'))))).toBe(false);
		expect(isEmptyDoc(doc(p(), image(1)))).toBe(false);
		expect(isEmptyDoc(doc({ type: 'horizontalRule' }))).toBe(false);
	});
});

describe('referencedUploads', () => {
	it('finds images, link-preview images and file cards', () => {
		const content = doc(
			image(1),
			{ type: 'linkPreview', attrs: { url: 'https://a.example/', imageId: 2 } },
			{ type: 'fileCard', attrs: { id: 7, name: 'a.pdf' } }
		);

		expect(referencedUploads(content)).toEqual({ images: [1, 2], files: [7] });
	});

	it('finds nodes nested in a toggle and a table, once each', () => {
		const content = doc(
			{
				type: 'details',
				content: [
					{ type: 'detailsSummary', content: [t('More')] },
					{ type: 'detailsContent', content: [image(4), image(4)] }
				]
			},
			{
				type: 'table',
				content: [
					{ type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'fileCard', attrs: { id: 9 } }] }] }
				]
			}
		);

		expect(referencedUploads(content)).toEqual({ images: [4], files: [9] });
	});

	it('ignores unsaved images, link previews without an image, and invalid input', () => {
		expect(referencedUploads(doc(image(null), { type: 'linkPreview', attrs: { imageId: null } }, p(t('x'))))).toEqual({
			images: [],
			files: []
		});
		expect(referencedUploads(null)).toEqual({ images: [], files: [] });
	});
});
