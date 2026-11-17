const stamp = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const editedAt = (iso: string) => stamp.format(new Date(iso));
export const createdOn = (iso: string) => day.format(new Date(iso));
// the count and its noun never part across a line break
export const tagCount = (n: number) => (n === 0 ? 'No tags' : n === 1 ? '1 tag' : `${n} tags`);
// a deep path keeps its first and last folder; the full path goes in the title
export const shortPath = (path: string[]) => (path.length > 3 ? [path[0], '…', path.at(-1)].join(' / ') : path.join(' / '));
