const stamp = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const editedAt = (iso: string) => stamp.format(new Date(iso));
export const createdOn = (iso: string) => day.format(new Date(iso));
export const tagCount = (n: number) => (n === 0 ? 'No tags' : n === 1 ? '1 tag' : `${n} tags`);
