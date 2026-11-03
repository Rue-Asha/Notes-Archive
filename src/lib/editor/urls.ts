// A paste counts as a link only when it is one http(s) URL and nothing else
export function standaloneUrl(text: string): string | null {
	const url = text.trim();
	if (!/^https?:\/\/\S+$/i.test(url) || !URL.canParse(url)) return null;
	return url;
}

export const domainOf = (url: string): string => (URL.canParse(url) ? new URL(url).hostname.replace(/^www\./, '') : url);
