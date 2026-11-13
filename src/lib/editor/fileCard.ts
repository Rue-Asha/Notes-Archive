import { Node } from '@tiptap/core';
import { mount, unmount } from 'svelte';
import Icon from '#lib/ui/Icon.svelte';
import { formatSize } from './upload.ts';

export function fileKind(mime: string, name: string): string {
	if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
	if (mime.startsWith('text/')) return 'text';
	if (/^(audio|video)\//.test(mime)) return mime.split('/')[0];
	if (/zip|compressed|tar/.test(mime)) return 'archive';
	return 'other';
}

// the kinds with a recognisable extension get a lettered badge; anything else keeps the generic file glyph
const BADGES: Record<string, string> = { pdf: 'PDF', text: 'TXT', audio: 'AUD', video: 'VID', archive: 'ZIP' };
const KIND_NAMES: Record<string, string> = { pdf: 'PDF file', text: 'Text file', audio: 'Audio file', video: 'Video file', archive: 'Archive' };

export const FileCard = Node.create({
	name: 'fileCard',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes() {
		return {
			id: { default: null, rendered: false },
			name: { default: 'file', rendered: false },
			size: { default: 0, rendered: false },
			mime: { default: 'application/octet-stream', rendered: false }
		};
	},
	parseHTML() {
		return [
			{
				tag: 'a.file-card',
				getAttrs: (el) => ({
					id: Number(el.getAttribute('href')?.match(/\/files\/(\d+)/)?.[1]) || null,
					name: el.querySelector('strong')?.textContent ?? 'file',
					size: Number(el.dataset.size) || 0,
					mime: el.dataset.mime ?? 'application/octet-stream'
				})
			}
		];
	},
	renderHTML({ node }) {
		const { id, name, size, mime } = node.attrs;
		return ['a', { class: 'file-card', href: `/files/${id}`, target: '_blank', rel: 'noopener', 'data-size': size, 'data-mime': mime }, ['strong', name], ['small', formatSize(size)]];
	},
	addNodeView() {
		return ({ node: initial }) => {
			const dom = document.createElement('a');
			dom.className = 'file-card';
			dom.target = '_blank';
			dom.rel = 'noopener';
			const badge = document.createElement('span');
			badge.className = 'file-icon';
			badge.setAttribute('role', 'img');
			const icon = mount(Icon, { target: badge, props: { name: 'file', size: 22 } });
			const text = document.createElement('span');
			text.className = 'file-text';
			const name = document.createElement('strong');
			const size = document.createElement('small');
			size.className = 'tnum';
			text.append(name, size);
			const arrow = document.createElement('span');
			arrow.className = 'file-open';
			const open = mount(Icon, { target: arrow, props: { name: 'arrow-right', size: 18 } });
			dom.append(badge, text, arrow);

			const show = (attrs: typeof initial.attrs) => {
				dom.href = `/files/${attrs.id}`;
				name.textContent = attrs.name;
				size.textContent = formatSize(attrs.size);
				const kind = fileKind(attrs.mime, attrs.name);
				badge.dataset.kind = kind;
				badge.setAttribute('aria-label', KIND_NAMES[kind] ?? 'File');
				if (BADGES[kind]) badge.dataset.badge = BADGES[kind];
				else delete badge.dataset.badge;
			};
			show(initial.attrs);

			// links inside the editable root aren't followed by the browser
			dom.addEventListener('click', (event) => {
				event.preventDefault();
				window.open(dom.href, '_blank', 'noopener');
			});

			return {
				dom,
				update(node) {
					if (node.type !== initial.type) return false;
					show(node.attrs);
					return true;
				},
				ignoreMutation: () => true,
				destroy() {
					unmount(icon);
					unmount(open);
				}
			};
		};
	}
});
