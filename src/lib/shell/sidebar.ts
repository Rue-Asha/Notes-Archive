export const STORAGE_KEY = 'notes-archive:sidebar-collapsed';

type Store = Pick<Storage, 'getItem' | 'setItem'>;

export function readCollapsed(storage?: Store): boolean {
	try {
		return (storage ?? localStorage).getItem(STORAGE_KEY) === '1';
	} catch {
		return false;
	}
}

export function writeCollapsed(collapsed: boolean, storage?: Store): void {
	try {
		(storage ?? localStorage).setItem(STORAGE_KEY, collapsed ? '1' : '0');
	} catch {
		// the rail still toggles for this page view
	}
}

// Runs in <head> before first paint so a collapsed sidebar doesn't flash open on every full page load.
export const RAIL_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})==='1')document.documentElement.setAttribute('data-rail','')}catch{}`;
