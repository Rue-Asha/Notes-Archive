import type { AnyExtension } from '@tiptap/core';
import { blockExtensions } from './blocks.ts';
import { bubbleExtensions } from './bubble.ts';
import type { EditorContext } from './context.ts';
import { coreExtensions } from './core.ts';
import { handleExtensions } from './handle.ts';
import { mediaExtensions } from './media.ts';
import { previewExtensions } from './preview.ts';
import { slashExtensions } from './slash.ts';

export function buildExtensions(ctx: EditorContext): AnyExtension[] {
	return [
		...coreExtensions(ctx),
		...blockExtensions(ctx),
		...slashExtensions(ctx),
		...bubbleExtensions(ctx),
		...handleExtensions(ctx),
		...mediaExtensions(ctx),
		...previewExtensions(ctx)
	];
}
