import express from 'express';
import { readdirSync, existsSync, readFileSync } from 'fs';
import path, { resolve, parse, join as pathJoin } from 'path';
import { execSync } from 'child_process';

const root = parse(process.cwd()).root;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let workDir = '';

function getDir(dirPath = '.', pwd) {
	const response = {};
	let endPath = dirPath;
	if (pwd) endPath = resolve(pwd, dirPath);
	if (!existsSync(endPath)) return {};
	const dir = readdirSync(endPath, { withFileTypes: true });
	response.folders = dir
		.filter((x) => x.isDirectory())
		.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()))
		.map((x) => x.name);
	response.files = dir
		.filter((x) => x.isFile())
		.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()))
		.map((x) => x.name);
	response.pwd = resolve(endPath);
	response.root = root === response.pwd;
	return response;
}

const commands = {
	degit: 'npx --yes degit',
	csa: 'npx create-sveltepress-app@2'
};

function runCommand(command, args) {
	if (command === commands.degit) {
		return runInTerm(`${command} ${args}`);
	}
}

function runInTerm(command) {
	console.log('About to run: ' + command);
	try {
		execSync(command, { stdio: 'inherit' });
		return 0;
	} catch (e) {
		console.error(e);
		return 1;
	}
}

app.post('/runCommand', (req, res) => {
	if (!req.body || !req.body.hasOwnProperty('command') || !req.body.hasOwnProperty('args')) {
		res.status(422);
		let whatsMissing = ['Command', 'Args'];
		if (!req.body.hasOwnProperty('command') && !req.body.hasOwnProperty('args')) {
			whatsMissing = `${whatsMissing[0]} & ${whatsMissing[1].toLowerCase()}`;
		} else {
			whatsMissing = whatsMissing[!req.body.hasOwnProperty('command') ? 0 : 1];
		}
		return res.json({
			type: 'error',
			msg: `${whatsMissing} is missing from POST body`
		});
	}
	const command = req.body.command.toLowerCase();
	if (!Object.keys(commands).includes(command)) {
		res.status(404);
		return res.json({
			type: 'error',
			msg: `Command '${command}' not found`
		});
	}
	const output = runCommand(commands[command], req.body.args);
	res.status(400);
	let response = { type: 'error', msg: `There was an error while running '${command}'` };
	if (output === 0) {
		res.status(200);
		response = {
			type: 'success'
		};
	}

	return res.json(response);
});

app.post('/ls', (req, res) => {
	if (!req.body || !req.body.hasOwnProperty('path')) {
		res.status(422);
		return res.json({
			type: 'error',
			msg: 'Path is missing from POST body'
		});
	}
	const response = getDir(req.body.path, req.body.pwd);
	if (Object.keys(response).length === 0) {
		res.status(404);
		return res.json({
			type: 'error',
			msg: "Folder doesn't exist"
		});
	}
	return res.json({
		type: 'success',
		alreadySet: !!workDir,
		...response
	});
});

app.post('/setworkdir', (req, res) => {
	if (!req.body || !req.body.hasOwnProperty('workdir')) {
		res.status(422);
		return res.json({
			type: 'error',
			msg: 'Workdir is missing from POST body'
		});
	}
	const exists = existsSync(req.body.workdir);
	if (!exists) {
		res.status(404);
		return res.json({
			type: 'error',
			msg: "WorkDir doesn't exist"
		});
	}
	workDir = req.body.workdir;
	return res.json({
		type: 'success'
	});
});

function postStats() {
	const response = {
		grandParents: 0,
		parents: 0,
		posts: 0
	};
	const grandParents = readdirSync(pathJoin(workDir, 'pages'), {
		withFileTypes: true
	}).filter((x) => x.isDirectory());
	response.grandParents = grandParents.length;
	grandParents.forEach((x) => {
		const result = countPosts(pathJoin(workDir, 'pages', x.name));
		response.parents = response.parents + result.parents;
		response.posts = response.posts + result.posts;
	});

	return response;
}

function countPosts(source) {
	const response = {
		parents: 0,
		posts: 0
	};

	const grandParent = readdirSync(source, { withFileTypes: true });
	grandParent.forEach((x) => {
		if (x.isDirectory()) {
			const parent = countPosts(pathJoin(source, x.name));
			response.parents = response.parents + parent.parents + 1; // this parent itself
			response.posts = response.posts + parent.posts;
		} else if (
			x.isFile() &&
			x.name.toLowerCase() !== 'readme.md' &&
			x.name.toLowerCase().endsWith('.md')
		) {
			response.posts = response.posts + 1;
		}
	});
	return response;
}

function getThemeName() {
	const themePkgJson = pathJoin(
		workDir,
		'src',
		'lib',
		'SveltePress',
		'theme',
		'meta',
		'package.json'
	);
	if (!existsSync(themePkgJson)) return 'Unknown';
	const parsedPkgJson = JSON.parse(readFileSync(themePkgJson, 'utf8'));
	if (!parsedPkgJson.hasOwnProperty('name') || parsedPkgJson?.name?.length === 0) return 'Unknown';
	return parsedPkgJson?.name;
}

function getFeatures() {
	const response = {
		gui: false,
		pandoc: false
	};
	response.gui = existsSync(pathJoin(workDir, 'gui'));
	response.pandoc = existsSync(pathJoin(workDir, 'pandoc'));
	return response;
}

app.get('/dashboard', (req, res) => {
	if (!workDir) {
		res.status(404);
		return res.json({
			type: 'error',
			msg: 'Workdir is not set',
			redirect: {
				status: 302,
				redirect: '/'
			}
		});
	}
	return res.json({
		type: 'success',
		data: {
			stats: postStats(),
			workdir: workDir,
			theme: getThemeName(),
			features: getFeatures()
		}
	});
});

app.listen('8080', () => {
	console.log('pong');
});
