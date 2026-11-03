import { Node } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';

const src = (id: number | null) => (id === null ? '' : `/images/${id}`);

export const Image = Node.create({
	name: 'image',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes() {
		return {
			id: {
				default: null,
				rendered: false,
				parseHTML: (el) => Number(el.querySelector('img')?.getAttribute('src')?.match(/\/images\/(\d+)$/)?.[1]) || null
			},
			width: { default: null, rendered: false, parseHTML: (el) => Number(el.querySelector('img')?.getAttribute('width')) || null },
			height: { default: null, rendered: false, parseHTML: (el) => Number(el.querySelector('img')?.getAttribute('height')) || null },
			caption: { default: '', rendered: false, parseHTML: (el) => el.querySelector('figcaption')?.textContent ?? '' }
		};
	},
	parseHTML() {
		return [{ tag: 'figure.image-block' }];
	},
	renderHTML({ node }) {
		const { id, width, height, caption } = node.attrs;
		const img = ['img', { src: src(id), width, height, alt: caption }];
		return ['figure', { class: 'image-block' }, img, ...(caption ? [['figcaption', caption]] : [])] as never;
	},
	addNodeView() {
		return ({ node: initial, editor, getPos }) => {
			const dom = document.createElement('figure');
			dom.className = 'image-block';
			const img = document.createElement('img');
			img.draggable = false;
			const figcaption = document.createElement('figcaption');
			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'image-caption';
			input.placeholder = 'Add a caption';
			input.autocomplete = 'off';
			input.setAttribute('aria-label', 'Caption');
			figcaption.append(input);
			dom.append(img, figcaption);

			const show = (attrs: typeof initial.attrs) => {
				img.src = src(attrs.id);
				if (attrs.width) img.width = attrs.width;
				if (attrs.height) img.height = attrs.height;
				img.alt = attrs.caption;
				if (input.value !== attrs.caption) input.value = attrs.caption;
				dom.dataset.empty = attrs.caption ? 'false' : 'true';
			};
			show(initial.attrs);

			input.addEventListener('input', () => {
				const pos = getPos();
				const node = pos === undefined ? null : editor.state.doc.nodeAt(pos);
				if (!node) return;
				editor.view.dispatch(editor.state.tr.setNodeMarkup(pos!, undefined, { ...node.attrs, caption: input.value }));
			});
			input.addEventListener('keydown', (event) => {
				if (event.key !== 'Enter') return;
				event.preventDefault();
				const pos = getPos();
				if (pos === undefined) return;
				const { state, view } = editor;
				view.dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(pos + initial.nodeSize), 1)));
				view.focus();
			});

			return {
				dom,
				update(node) {
					if (node.type !== initial.type) return false;
					show(node.attrs);
					return true;
				},
				stopEvent: (event) => event.target === input,
				ignoreMutation: () => true
			};
		};
	}
});
