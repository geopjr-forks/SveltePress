import { getSide, getNav } from '$lib/SveltePress/SveltePressData';

// Sidebar & navbar gets saved in session
export async function getSession() {
	return new Map([
		['sidebar', await getSide()],
		['navbar', await getNav()]
	]);
}
