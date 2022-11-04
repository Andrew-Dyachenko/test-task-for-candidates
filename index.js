'use strict'

const app = {
	// Initial state
	state: {
		data: [],
		searchQuery: '',

		// External data API
		// url: 'https://jsonplaceholder.typicode.com/posts/?_start=0&_limit=7',

		// Github data API
		url: 'https://raw.githubusercontent.com/Andrew-Dyachenko/test-task-for-candidates/master/data.json',
		storageName: 'gate31'
	},

	// Set state func
	setState(newState) {
		this.state = {
			...this.state,
			...newState
		}

		this.render();
	},

	// Init
	async init(state) {
		// Add user data to the state if it's exist
		if (state) this.setState({ state });

		// Get cache
		const cache = this.getStorage(this.state.storageName);

		// Set cache instead of fetch
		if (cache) this.setState({ data: cache });

		// Set cache
		else {
			// Fetch data
			const data = await this.fetch(this.state.url);

			// If data is correct save it to storage and state
			if (data) {

				// Set state
				this.setState({ data });

				// Set storage
				this.setStroage(this.state.storageName, data);
			}
		}

		// Get search field
		const search = document.getElementById('search');

		// Get submit button
		const submit = document.getElementById('submit');

		// Get form
		const form = document.getElementById('form');

		// If data exist
		if (this.state.data.length) {
			// Get URL bar search
			const searchQuery = this.getSearchParam('searchQuery');

			this.setState({ searchQuery });
			search.value = searchQuery;

			// Enable serach field
			search.removeAttribute('disabled');

			// Enable submit button
			submit.removeAttribute('disabled');

			// Add form onsubmit event
			form.addEventListener('submit', this.search.bind(app, search));
		}

		else {
			// Disable serach field
			search.addAttribute('disabled');

			// Disable submit button
			submit.addAttribute('disabled');

			// Remove form onsubmit event
			form.removeEventListener('submit', this.search);
		}

		// Render list
		this.render();
	},

	// Get URL search param(s)
	getSearchParam(paramName = '') {
		// Create search params object from existing window location URL
		const searchParams = new URLSearchParams(window.location.search);

		// Find & extract neccessary param
		const searchQuery = searchParams.get(paramName);

		// Return founded param
		return searchQuery;
	},

	// Search
	search: (search, event) => {
		// Prevent default html form behavior
		event.preventDefault();

		// Get search value (query)
		const searchQuery = search.value;

		// Set search query to the state
		app.setState({ searchQuery });

		// Get window.location properties
		const { protocol, host, pathname } = window.location;

		// Create new URL with searchQuery
		const newURL = `${protocol}//${host}${pathname}?searchQuery=${searchQuery}`;

		// Push the new history URL to the address bar without the page reload
		window.history.pushState({ path: newURL }, '', newURL);
	},

	// Get Session Storage
	getStorage: key =>
		key && JSON.parse(sessionStorage.getItem(key)),

	// Set Session Storage
	setStroage: (key, data) =>
		sessionStorage.setItem(key, JSON.stringify(data)),

	// Fetch wrapper
	async fetch(url) {
		// Initial fetch data
		let data;

		await fetch(url)
			.then(res => res.json())
			.then(json => {
				data = json;
				return json;
			})
			.catch(console.error);

		// Return fetch data result
		return data;
	},

	// Render app
	render() {
		// List
		const list = document.getElementById('form__list');

		// If data array is not empty
		if (this.state.data.length) {
			// Template
			const template = document.getElementById('form__item--template');

			// Clear DOM list before a new render
			list.innerHTML = '';

			// Render all data
			this.state.data
				// Filter data by the search field
				.filter(({ title }) => {
					// Get search query
					const { searchQuery } = this.state;

					// Filter condition
					if (this.state.searchQuery) {
						const regex = new RegExp(searchQuery, 'g');
						return regex.test(title);
					}

					// If search query is empty cancel filtering
					return true;
				})
				// Display ...rest data after the filtering
				.forEach((item, index) => {

					// Clone template
					const clone = template.content.cloneNode(true);

					// Find title node inside a clone
					const title = clone.querySelector('.item__title');

					// Find text node inside a clone
					const text = clone.querySelector('.item__text');

					// Fill the title clone
					title.textContent = item.title;

					// Fill the text clone
					text.textContent = item.body;

					// Create comment with item's index
					const comment = document.createComment(` ${index + 1} `)

					// Prepend the comment inside the clone
					clone.prepend(comment);

					// Append the clone
					list.appendChild(clone);
				});
		}

		// If data array is empty
		else {
			list.innerText = 'No data founded';
		}
	}
}

// We don't actually need DOMContentLoaded because of the defer attribute, but we use it as a fallback
document.addEventListener('DOMContentLoaded', () => {
	// App init
	app.init();
});
