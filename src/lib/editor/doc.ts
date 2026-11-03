import type { JSONContent } from '#lib/types.ts';

export function docFromText(body: string): JSONContent {
	return {
		type: 'doc',
		content: body.split('\n').map((line) => (line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' }))
	};
}
