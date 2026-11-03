import { getSchema } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { coreExtensions } from './core.ts';
import { sanitize } from './sanitize.ts';

const schema = getSchema(coreExtensions({ noteId: 1, toast: () => {}, touch: false }));
const text = (t: string, marks?: { type: string }[]) => ({ type: 'text', text: t, ...(marks ? { marks } : {}) });
const para = (...content: object[]) => ({ type: 'paragraph', content });

describe('sanitize', () => {
	it('keeps a document the schema knows as it is', () => {
		const doc = {
			type: 'doc',
			content: [
				{ type: 'heading', attrs: { level: 2 }, content: [text('Rooms')] },
				para(text('Living ', [{ type: 'bold' }]), text('room')),
				{ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: true }, content: [para(text('Plan'))] }] }
			]
		};
		expect(sanitize(doc, schema)).toEqual(doc);
	});

	it('turns an unknown block into a paragraph holding its text', () => {
		const doc = { type: 'doc', content: [{ type: 'mysteryBlock', attrs: { x: 1 }, content: [text('Altes Format')] }] };
		const out = sanitize(doc, schema);
		expect(out).toEqual({ type: 'doc', content: [para(text('Altes Format'))] });
		expect(() => schema.nodeFromJSON(out).check()).not.toThrow();
	});

	it('flattens an unknown container of blocks into one paragraph', () => {
		const doc = { type: 'doc', content: [{ type: 'oldColumns', content: [para(text('Links')), para(text('Rechts'))] }] };
		expect(sanitize(doc, schema).content).toEqual([para(text('Links Rechts'))]);
	});

	it('turns an unknown inline node into text and drops one without text', () => {
		const doc = { type: 'doc', content: [para(text('Hallo '), { type: 'mention', content: [text('Rue')] }, { type: 'emojiAtom' })] };
		const out = sanitize(doc, schema);
		expect(out.content).toEqual([para(text('Hallo '), text('Rue'))]);
		expect(() => schema.nodeFromJSON(out).check()).not.toThrow();
	});

	it('drops unknown marks and empty text nodes', () => {
		const doc = { type: 'doc', content: [para(text('Wort', [{ type: 'bold' }, { type: 'sparkle' }]), text(''))] };
		expect(sanitize(doc, schema).content).toEqual([para(text('Wort', [{ type: 'bold' }]))]);
	});

	it('answers an empty document for invalid input', () => {
		const empty = { type: 'doc', content: [{ type: 'paragraph' }] };
		for (const input of [null, 'doc', {}, { type: 'paragraph' }, { type: 'doc', content: [] }]) expect(sanitize(input, schema)).toEqual(empty);
	});
});
