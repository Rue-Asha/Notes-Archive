import { describe, expect, it } from 'vitest';
import { readCollapsed, STORAGE_KEY, writeCollapsed } from './sidebar.ts';

function fakeStorage() {
	const data = new Map<string, string>();
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		data
	};
}

describe('sidebar state', () => {
	it('starts expanded', () => {
		expect(readCollapsed(fakeStorage())).toBe(false);
	});

	it('remembers collapsed and expanded', () => {
		const storage = fakeStorage();
		writeCollapsed(true, storage);
		expect(readCollapsed(storage)).toBe(true);
		writeCollapsed(false, storage);
		expect(readCollapsed(storage)).toBe(false);
		expect(storage.data.get(STORAGE_KEY)).toBe('0');
	});

	it('survives storage that throws', () => {
		const broken = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		};
		expect(readCollapsed(broken)).toBe(false);
		expect(() => writeCollapsed(true, broken)).not.toThrow();
	});
});
