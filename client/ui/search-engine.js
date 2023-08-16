import { GeneralAgent } from '../agents/general/general-agent.js'

const MIN_HEIGHT = 2

let lastQuery = {}
let isVisible = isNowVisible()
let lastTimeout = null

export async function init(server, poolId, refreshInterval, { onResults }) {
	const quantelAgent = new GeneralAgent(server)
	let firstQuery = true

	function setQuery(query) {
		query.poolId = poolId
		lastQuery = Object.assign({}, query)

		clearTimeout(lastTimeout)
		performSearch(
			{ agent: quantelAgent, query, onResults, ignoreVisible: firstQuery },
			refreshInterval
		).catch(console.error)

		firstQuery = false
	}

	function refreshLastQuery() {
		clearTimeout(lastTimeout)
		performSearch({ agent: quantelAgent, query: lastQuery, onResults }, refreshInterval).catch(
			console.error
		)
	}

	window.addEventListener('resize', () => {
		const oldVisible = isVisible
		isVisible = isNowVisible()

		if (isVisible === true && oldVisible === false) {
			refreshLastQuery()
		}
	})

	return {
		setQuery
	}
}

async function performSearch({ agent, query, onResults, ignoreVisible }, refreshAfter) {
	if (isVisible || ignoreVisible) {
		try {
			const result = await agent.searchClip(query)

			if (isSameQuery(query, lastQuery)) {
				onResults(result.clips)
			}
		} catch (error) {
			console.error('Error while building clip list', error)
		}
	}
	if (!Number.isNaN(refreshAfter) && refreshAfter > 0 && isSameQuery(query, lastQuery)) {
		lastTimeout = setTimeout(
			performSearch,
			refreshAfter,
			{ agent, query, onResults },
			refreshAfter
		)
	}
}

function isSameQuery(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}

function isNowVisible() {
	if (window.innerHeight <= MIN_HEIGHT) {
		return false
	}

	return true
}
