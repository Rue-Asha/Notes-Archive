import { describe, expect, it } from 'vitest';
import { domainOf, standaloneUrl } from './urls.ts';

describe('standaloneUrl', () => {
	it('accepts a lone http or https URL, trimmed', () => {
		expect(standaloneUrl('https://garden.example/')).toBe('https://garden.example/');
		expect(standaloneUrl('  http://garden.example/a?b=1#c\n')).toBe('http://garden.example/a?b=1#c');
	});

	it('rejects other schemes, bare hosts and malformed input', () => {
		for (const text of ['htp:/kaputt', 'ftp://garden.example/', 'javascript:alert(1)', 'garden.example', 'https://', '', '   ']) {
			expect(standaloneUrl(text), text).toBeNull();
		}
	});

	it('rejects a URL inside a sentence', () => {
		expect(standaloneUrl('Siehe https://garden.example/')).toBeNull();
		expect(standaloneUrl('https://garden.example/ und mehr')).toBeNull();
		expect(standaloneUrl('https://a.example/\nhttps://b.example/')).toBeNull();
	});
});

describe('domainOf', () => {
	it('gives the host without www', () => {
		expect(domainOf('https://www.garden.example/x')).toBe('garden.example');
		expect(domainOf('http://192.168.1.10/admin')).toBe('192.168.1.10');
	});
});
