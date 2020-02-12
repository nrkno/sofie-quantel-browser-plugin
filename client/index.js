import { QuantelAgent } from './agents/quantel/quantel-agent.js'

function init() {
	const host = new URLSearchParams(document.location.search.substring(1)).get('server')
	console.log('Using host', host)
	const quantelAgent = new QuantelAgent(host)

	document.querySelector('form.search').addEventListener('submit', async (event) => {
		event.preventDefault()
		const query = document.forms.search.elements.query.value
		if (query) {
			const { clips } = await quantelAgent.searchClip(query)
			const resultsList = document.querySelector('.clips')
			clips.forEach((clip) => {
				const listItem = document.createElement('li')
				listItem.textContent = clip.title
				listItem.dataset.guid = clip.guid
				resultsList.appendChild(listItem)
			})
		}
	})
}

init()
