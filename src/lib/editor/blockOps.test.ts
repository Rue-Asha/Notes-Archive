import { Schema } from '@tiptap/pm/model';
import { describe, expect, it } from 'vitest';
import { moveBlock } from './blockOps.ts';

const schema = new Schema({
	nodes: {
		doc: { content: 'block+' },
		paragraph: { group: 'block', content: 'text*' },
		heading: { group: 'block', content: 'text*', attrs: { level: { default: 1 } } },
		text: {}
	}
});

const doc = schema.node('doc', null, [
	schema.node('paragraph', null, [schema.text('Eins')]),
	schema.node('heading', { level: 2 }, [schema.text('Zwei')]),
	schema.node('paragraph', null, [schema.text('Drei')])
]);

const order = (d: { content: { forEach(f: (n: { textContent: string }) => void): void } }) => {
	const texts: string[] = [];
	d.content.forEach((n) => texts.push(n.textContent));
	return texts;
};

describe('moveBlock', () => {
	it('Scenario: Moving blocks is a pure document transform', () => {
		expect(order(moveBlock(doc, 1, 'up')!)).toEqual(['Zwei', 'Eins', 'Drei']);
		expect(order(moveBlock(doc, 1, 'down')!)).toEqual(['Eins', 'Drei', 'Zwei']);
		expect(moveBlock(doc, 0, 'up')).toBeNull();
		expect(moveBlock(doc, 2, 'down')).toBeNull();
		expect(order(doc)).toEqual(['Eins', 'Zwei', 'Drei']);
		expect(moveBlock(doc, 1, 'up')!.child(0).type.name).toBe('heading');
		expect(moveBlock(doc, 1, 'up')!.child(0).attrs.level).toBe(2);
	});
});
