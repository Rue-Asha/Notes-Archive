import { json } from '@sveltejs/kit';
import { discardIfEmpty } from '#lib/server/notes.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ params }) => json({ discarded: discardIfEmpty(Number(params.id)) });
