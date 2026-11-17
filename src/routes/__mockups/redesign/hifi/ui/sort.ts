import type { TreeSort } from '../../fixtures.ts';

/* The one source of the four sort labels (tree menu and overlays). Proposed for gate 5:
   alternative from the overlays unit: "Folders by name, notes by edit" / "Name" / "Last edited" / "Date created". */
export const sortLabels: Record<TreeSort, string> = { mixed: 'Default', name: 'Name', edited: 'Last edited', created: 'Created' };
export const sortHints: Record<TreeSort, string> = { mixed: 'Folders A–Z, notes by last edit', name: 'Folders and notes A–Z', edited: 'Newest first', created: 'Newest first' };
