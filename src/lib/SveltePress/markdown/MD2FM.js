// import fm from 'front-matter';
import { mdConverter } from './MDConverter.js';

export default async function md2fm(content) {
	const mdsvexCompiled = await mdConverter(content);

	return {
		attributes: mdsvexCompiled.data?.fm ?? {},
		// body is used for search indexing
		// since mdsvex supports using different
		// markers for fm (and not just `---`)
		// for now it will include the fm data
		body: content
	};
}
