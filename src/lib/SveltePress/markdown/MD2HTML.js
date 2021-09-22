import { mdConverter } from '$lib/SveltePress/markdown/MDConverter';
import { getContent } from '$lib/SveltePress/SveltePressData';

import { readFileSync, existsSync } from 'fs';
import path from 'path';

export async function md2html(post) {
	try {
		let md = '';

		// First block handles dev mode
		// reads the file directly from disk
		// allowing md modifications without
		// the need to HMR
		// Second block handles prod
		// reads files from db
		if (!getContent()) {
			let fullPath = path.resolve(`pages/${post}.md`);
			if (!existsSync(fullPath)) {
				return {
					error: true,
					status: 404
				};
			}
			md = readFileSync(fullPath).toString();
		} else {
			let fullPath = getContent().has(`${post}.md`);
			if (!fullPath) {
				return {
					error: true,
					status: 404
				};
			}
			md = getContent().get(`${post}.md`);
		}

		// const frontmatter = md2fm(md);
		const content = await mdConverter(md);
		// meta includes ALL fm attributes
		return {
			body: content.code,
			meta: content.data?.fm || {}
		};
	} catch (e) {
		return {
			error: true,
			status: 500
		};
	}
}
