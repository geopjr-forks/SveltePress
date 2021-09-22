// import marked from 'marked';
// import sanitizeHtml from 'sanitize-html';
// import hljs from 'highlight.js';

import { compile } from 'mdsvex';

// // sanitize-html options
// const sanitizeOptions = {
// 	allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
// 	allowedClasses: {
// 		code: ['language-*', 'lang-*'],
// 		span: ['hljs-*']
// 	},
// 	selfClosing: []
// };

// // Marked options
// marked.setOptions({
// 	renderer: new marked.Renderer(),
// 	highlight: function (code, lang) {
// 		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
// 		return hljs.highlight(code, { language }).value;
// 	},
// 	pedantic: false,
// 	gfm: true,
// 	breaks: false,
// 	sanitize: false,
// 	smartLists: true,
// 	smartypants: false,
// 	xhtml: false
// });

const mdsvexOptions = {
	extensions: ['.md'],
	
}

// Here you can change the default markdown converter
export async function mdConverter(content) {
	// const html = marked(content);
	// // Sanitize it
	// return sanitizeHtml(html, sanitizeOptions);
	return await compile(content, mdsvexOptions)
}