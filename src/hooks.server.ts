import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { lookAttrs } from '#lib/styles/look.ts';
import { getDb } from '#lib/server/db.ts';
import { purgeOrphans } from '#lib/server/notes.ts';

// opening the database here makes a failing migration stop the server at start instead of at the first request
export const init: ServerInit = () => {
	getDb();
	purgeOrphans();
};

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, { transformPageChunk: ({ html }) => html.replace('%look%', lookAttrs()) });
