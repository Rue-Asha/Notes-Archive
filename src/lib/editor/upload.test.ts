import { describe, expect, it } from 'vitest';
import { COPY } from '#lib/copy.ts';
import { MAX_BYTES, failureMessage, fileProblem, formatSize, imageProblem } from './upload.ts';

describe('browser-side upload checks', () => {
	it('lets an image up to 16 MiB through and refuses beyond', () => {
		expect(imageProblem({ type: 'image/png', size: MAX_BYTES })).toBeNull();
		expect(imageProblem({ type: 'image/png', size: MAX_BYTES + 1 })).toBe(COPY.imageTooLarge);
	});

	it('refuses a non-image before looking at its size', () => {
		expect(imageProblem({ type: 'application/pdf', size: 10 })).toBe(COPY.notAnImage);
		expect(imageProblem({ type: '', size: MAX_BYTES + 1 })).toBe(COPY.notAnImage);
	});

	it('accepts any file type up to 16 MiB, empty included', () => {
		expect(fileProblem({ type: '', size: 0 })).toBeNull();
		expect(fileProblem({ type: 'text/plain', size: MAX_BYTES })).toBeNull();
		expect(fileProblem({ type: 'application/pdf', size: MAX_BYTES + 1 })).toBe(COPY.fileTooLarge);
	});

	it('maps server answers to toast copy', () => {
		expect(failureMessage(413)).toBe(COPY.imageTooLarge);
		expect(failureMessage(415)).toBe(COPY.notAnImage);
		expect(failureMessage(500)).toBe(COPY.uploadFailed);
	});
});

describe('formatSize', () => {
	it('formats bytes, kilobytes and megabytes', () => {
		expect(formatSize(0)).toBe('0 B');
		expect(formatSize(1000)).toBe('1000 B');
		expect(formatSize(1536)).toBe('1.5 KB');
		expect(formatSize(2 * 1024 * 1024)).toBe('2 MB');
		expect(formatSize(2.4 * 1024 * 1024)).toBe('2.4 MB');
		expect(formatSize(16 * 1024 * 1024)).toBe('16 MB');
	});
});
