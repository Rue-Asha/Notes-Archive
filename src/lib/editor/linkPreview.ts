import { Node } from '@tiptap/core';
import { standaloneUrl } from './urls.ts';

export const LinkPreview = Node.create({
	name: 'linkPreview',
	group: 'block',
	atom: true,
	draggable: true,
	addAttributes() {
		const text = (key: string) => ({
			default: null,
			rendered: false,
			parseHTML: (el: HTMLElement) => el.dataset[key] ?? null
		});
		return {
			url: { default: '', rendered: false, parseHTML: (el: HTMLElement) => el.getAttribute('href') ?? '' },
			domain: { default: '', rendered: false, parseHTML: (el: HTMLElement) => el.dataset.domain ?? '' },
			title: text('title'),
			description: text('description'),
			siteName: text('siteName'),
			imageId: {
				default: null,
				rendered: false,
				parseHTML: (el: HTMLElement) => Number(el.querySelector('img')?.getAttribute('src')?.match(/\/images\/(\d+)$/)?.[1]) || null
			}
		};
	},
	parseHTML() {
		return [{ tag: 'a.link-card' }];
	},
	renderHTML({ node }) {
		const { url, domain, title, description, siteName, imageId } = node.attrs;
		const attrs: Record<string, string> = { class: 'link-card', href: url, 'data-domain': domain };
		if (title) attrs['data-title'] = title;
		if (description) attrs['data-description'] = description;
		if (siteName) attrs['data-site-name'] = siteName;
		// without a title the card falls back to the domain and the URL
		const text = ['div', ['strong', title ?? domain], ['p', description ?? ''], ['small', title ? (siteName ?? domain) : url]];
		return ['a', attrs, ...(imageId ? [['img', { src: `/images/${imageId}`, alt: '' }]] : []), text] as never;
	},
	addNodeView() {
		return ({ node: initial }) => {
			const dom = document.createElement('a');
			dom.className = 'link-card';
			dom.target = '_blank';
			dom.rel = 'noopener noreferrer';
			let image: HTMLImageElement | null = null;
			const text = document.createElement('div');
			const title = document.createElement('strong');
			const description = document.createElement('p');
			const site = document.createElement('small');
			text.append(title, description, site);
			dom.append(text);

			const show = (attrs: typeof initial.attrs) => {
				// the URL came from a stored document, so only http(s) becomes a link
				const url = standaloneUrl(attrs.url);
				if (url) dom.href = url;
				else dom.removeAttribute('href');
				title.textContent = attrs.title ?? attrs.domain;
				description.textContent = attrs.description ?? '';
				description.hidden = !attrs.description;
				site.textContent = attrs.title ? (attrs.siteName ?? attrs.domain) : attrs.url;
				if (attrs.imageId && !image) {
					image = document.createElement('img');
					image.alt = '';
					dom.prepend(image);
				}
				if (!attrs.imageId && image) {
					image.remove();
					image = null;
				}
				if (image) image.src = `/images/${attrs.imageId}`;
			};
			show(initial.attrs);

			dom.addEventListener('click', (event) => {
				event.preventDefault();
				if (dom.href) window.open(dom.href, '_blank', 'noopener,noreferrer');
			});

			return {
				dom,
				update(node) {
					if (node.type !== initial.type) return false;
					show(node.attrs);
					return true;
				},
				ignoreMutation: () => true
			};
		};
	}
});
