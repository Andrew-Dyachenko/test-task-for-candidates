'use strict'

// const compose = (...fns) =>
// 	arg => fns.reduce(
// 		(composed, f) => f(composed),
// 		arg
// 	);

const loadStorage = key => key && JSON.parse(sessionStorage.getItem(key));
const setStroage = (key, data) => sessionStorage.setItem(key, JSON.stringify(data));
const _fetch = async url => {
	const cache = loadStorage('gate31'); // Get cache
	// console.log('cache: ', cache);
	if (cache) return cache; // Cache

	let data;

	await fetch(url)
		.then(res => res.json())
		.then(json => {
			// console.log('json: ', json);
			setStroage('gate31', json); // Set cache
			data = json;
			return json;
		})
		.catch(console.error);

	return data;
}

const generateChildren = data => {
	console.log('data: ', data);
	// const stringified = JSON.stringify(data, null, 2); // TMP
	// console.log('stringified: ', stringified);
	const fragment = document.createDocumentFragment();
	const ol = document.createElement('ol');
	fragment.appendChild(ol);
	data.forEach(({ title }) => {
		// console.log('title: ', title);
		const li = document.createElement('li');
		li.innerText = title;
		ol.appendChild(li);
	})

	fragment.appendChild(ol);

	return fragment;
}

const isPromise = arg => {
	if (typeof arg === 'object' && typeof arg.then === 'function') {
		return true;
	}

	return false;
}
// const pipeAwait = (...fns) => param => fns.reduce(async (result, next) => next(await result), param)
const asyncCompose = (...fns) =>
	arg => {
		console.log('arg: ', arg);
		return fns.reduce(
			async (composed, f) => isPromise(composed) ? await f(composed) : f(composed),
			Promise.resolve(arg)
		);

		// return arg => fns.reduce(
		// 	(composed, f) => f(composed),
		// 	arg
		// );
	}


const render = root => {
	console.log('root: ', root);
	return fragment => {
		console.log('fragment: ', fragment);
		document
			.getElementById(root)
			.appendChild(fragment);
	}
}

const app = asyncCompose(
	_fetch,
	generateChildren,
	render.bind(Object.create(null), document.getElementById('root'))
);

// We don't actually need DOMContentLoaded because of the defer attribute, but we use it as a fallback
document.addEventListener('DOMContentLoaded', () => {
	app('https://jsonplaceholder.typicode.com/posts/?_start=0&_limit=7');
});
