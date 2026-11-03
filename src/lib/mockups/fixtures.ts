// Fixture data for the static mockups at /__mockups/*. Shapes follow design.md → Contracts loosely (U3 owns the
// real types); nothing here is read by feature code.
export const photo = (name: string) => `/__mockups/photo/${name}.jpg`;

export interface MockNote {
	id: number;
	icon: string | null;
	title: string;
	snippet: string;
	tags: string[];
	updated: string;
	pinned?: boolean;
}

export interface MockFolder {
	id: number;
	name: string;
	notes: number;
	cover: string | null;
	// the typographic tile's warm tint when there is no photo
	tint?: 'accent' | 'stone' | 'sand';
	position?: string;
}

export interface MockTreeFolder {
	name: string;
	open?: boolean;
	current?: boolean;
	children?: MockTreeFolder[];
	notes?: { title: string; icon: string; current?: boolean }[];
}

export const notes: MockNote[] = [
	{
		id: 1,
		icon: '🏡',
		title: 'Courtyard house, first sketches',
		snippet: 'A low volume around a walled garden, stone to the street and glass to the inside. The roof edge stays thin.',
		tags: ['architecture', 'ideas'],
		updated: '2 Nov',
		pinned: true
	},
	{
		id: 2,
		icon: '🍞',
		title: 'Sourdough, the long weekend method',
		snippet: 'Mix Friday evening, fold twice on Saturday, bake Sunday morning in the Dutch oven at 240 degrees.',
		tags: ['recipes'],
		updated: '1 Nov',
		pinned: true
	},
	{
		id: 3,
		icon: '🗺️',
		title: 'Lisbon in April, a loose plan',
		snippet: 'Three days, no rental car. Alfama in the morning, the river at dusk, one long lunch in Campo de Ourique.',
		tags: ['travel'],
		updated: '30 Oct',
		pinned: true
	},
	{
		id: 4,
		icon: '📚',
		title: 'Reading list 2026',
		snippet: 'Finish the Calvino, then the architecture essays. Something quiet for the train in between.',
		tags: ['reading', 'ideas'],
		updated: '29 Oct'
	},
	{
		id: 5,
		icon: '🪴',
		title: 'Plants by the north window',
		snippet: 'The fern wants more humidity, the pothos wants less of everything. Water on Sundays, not before.',
		tags: ['home'],
		updated: '27 Oct'
	},
	{
		id: 6,
		icon: '🧱',
		title: 'Stone and timber, material notes',
		snippet: 'Travertine for the floor, oiled oak for the doors. Keep the palette to three materials and one metal.',
		tags: ['architecture', 'home'],
		updated: '25 Oct'
	},
	{
		id: 7,
		icon: '☕',
		title: 'Studio meeting, Thursday',
		snippet: 'Agreed on the colour study first. Lena sends the plans on Monday, the budget waits until then.',
		tags: ['work'],
		updated: '23 Oct'
	},
	{
		id: 8,
		icon: '🌄',
		title: 'Moraine Lake, a morning',
		snippet: 'Up at five, the light on the peaks around seven. Bring the warm jacket and the thermos, not the tripod.',
		tags: ['travel', 'photos'],
		updated: '19 Oct'
	},
	{
		id: 9,
		icon: null,
		title: 'Quiet kitchen shelf list',
		snippet: 'Four jars, one board, one lamp. Nothing that needs dusting every week.',
		tags: ['home'],
		updated: '14 Oct'
	},
	{
		id: 10,
		icon: '💡',
		title: 'Ideas I keep coming back to',
		snippet: 'A year of one photograph a day. A small book of the walks. A reading room with only one chair.',
		tags: ['ideas'],
		updated: '9 Oct'
	}
];

export const pinned = notes.filter((n) => n.pinned);
export const recent = notes.slice(0, 8);

export const folders: MockFolder[] = [
	{ id: 1, name: 'Architecture', notes: 14, cover: 'house-solitude', position: '50% 30%' },
	{ id: 2, name: 'Interiors', notes: 9, cover: 'interior-living' },
	{ id: 3, name: 'Landscapes', notes: 6, cover: 'lake-moraine' },
	{ id: 4, name: 'Travel', notes: 11, cover: 'lake-greek' },
	{ id: 5, name: 'Recipes', notes: 23, cover: null, tint: 'accent' },
	{ id: 6, name: 'Journal', notes: 41, cover: null, tint: 'stone' }
];

export const subfolders: MockFolder[] = [
	{ id: 11, name: 'Houses', notes: 5, cover: 'house-midcentury' },
	{ id: 12, name: 'Materials', notes: 4, cover: 'stone-sand' },
	{ id: 13, name: 'References', notes: 5, cover: null, tint: 'sand' }
];

export const tags: { name: string; count: number }[] = [
	{ name: 'architecture', count: 18 },
	{ name: 'travel', count: 14 },
	{ name: 'ideas', count: 12 },
	{ name: 'home', count: 9 },
	{ name: 'recipes', count: 7 },
	{ name: 'reading', count: 5 }
];

export const tree: MockTreeFolder[] = [
	{
		name: 'Architecture',
		open: true,
		current: true,
		children: [
			{
				name: 'Houses',
				open: true,
				notes: [
					{ title: 'Courtyard house, first sketches', icon: '🏡', current: true },
					{ title: 'Stone and timber', icon: '🧱' }
				]
			},
			{ name: 'Materials' },
			{ name: 'References' }
		]
	},
	{ name: 'Interiors' },
	{ name: 'Landscapes' },
	{ name: 'Travel' },
	{ name: 'Recipes' },
	{ name: 'Journal' }
];

export const searchResults = [
	{
		icon: '🏡',
		title: 'Courtyard house, first sketches',
		folder: 'Architecture / Houses',
		before: 'A low volume around a walled ',
		hit: 'garden',
		after: ', stone to the street and glass to the inside.'
	},
	{
		icon: '🪴',
		title: 'Plants by the north window',
		folder: 'Home',
		before: 'Water on Sundays. The ',
		hit: 'garden',
		after: ' centre sells the fern food in small bottles.'
	},
	{
		icon: '🗺️',
		title: 'Lisbon in April, a loose plan',
		folder: 'Travel',
		before: 'Alfama in the morning, the botanical ',
		hit: 'garden',
		after: ' after lunch, the river at dusk.'
	}
];

export const recentSearches = ['courtyard', 'sourdough', 'travertine', 'reading list'];
