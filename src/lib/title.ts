import { COPY } from './copy.ts';

export function titleLine(title: string): string {
	return title.replace(/[\r\n]+/g, ' ').trim() || COPY.untitled;
}
