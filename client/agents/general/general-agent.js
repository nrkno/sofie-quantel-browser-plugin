export { GeneralAgent, periodPresets }

const paths = {
	SEARCH: '/search'
}

const REQUESTS = {
	CLIP_SEARCH: {
		path: paths.SEARCH,
		params: {
			TITLE: 'title',
			CREATED: 'created',
			POOL_ID: 'poolId'
		}
	}
}

const periodPresets = {
	TODAY: 'TODAY',
	LAST_7_DAYS: 'LAST_7_DAYS',
	LAST_30_DAYS: 'LAST_30_DAYS',
	LAST_365_DAYS: 'LAST_365_DAYS'
}

class GeneralAgent {
	/**
	 * Create an agent.
	 *
	 * @param {string} host - Address to the Quantel server to query
	 */

	constructor(host) {
		this.host = host
	}

	/**
	 * Search for clips matching the given criteria.
	 *
	 * Special note on the created criteria: use one of the exported `periodPresets`
	 *
	 * @param {object} criteria - query criteria
	 * @param {string} criteria.title - clip title criteria. * is allowed as a wildcard
	 * @param {string} criteria.created - scope the search to clips created in a specific period
	 * @param {string} criteria.poolId - optional poolId to be forwarded to the backend search agent
	 *
	 * @returns {Promise} - a promise containing the search results
	 */

	searchClip(criteria) {
		const { path, params } = REQUESTS.CLIP_SEARCH

		const url = new URL(this.host)
		url.pathname = url.pathname + path
		if (criteria?.title) url.searchParams.append(params.TITLE, criteria?.title)
		if (criteria?.created) url.searchParams.append(params.CREATED, criteria?.created)
		if (criteria?.poolId) url.searchParams.append(params.POOL_ID, criteria?.poolId)

		return fetch(url.href).then((response) => {
			if (response.ok) {
				return response.json()
			} else
				throw new Error(
					`Unable to fetch results: ${response.status} - ${response.statusText}`
				)
		})
	}
}
