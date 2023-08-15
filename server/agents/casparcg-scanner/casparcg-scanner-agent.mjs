import fetch from 'node-fetch'
export { CasparCGScannerAgent }

const paths = {
	SEARCH: 'media',
	STILLS: 'media/thumbnail/'
}

const REQUESTS = {
	CLIP_SEARCH: {
		path: paths.SEARCH
	}
}

/** Agent for quering a CasparCG Scanner media scanner */
class CasparCGScannerAgent {
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
	 * Special note on the created criteria:
	 * Solr date search syntax used. Example for everything created within the last 2 days:
	 * [NOW-2DAY/DAY TO NOW]
	 *
	 * @param {object} criteria - query criteria
	 * @param {string} criteria.title - clip title criteria. * is allowed as a wildcard
	 * @param {string} criteria.created - scope the search to clips created in a specific period
	 *
	 * @returns {Promise} - a promise containing the search results
	 */

	searchClip(criteria) {
		const { path } = REQUESTS.CLIP_SEARCH

		const url = new URL(this.host)
		url.pathname = url.pathname + path

		return fetch(url.href)
			.then((response) => {
				if (response.ok) {
					return response.json()
				} else
					throw new Error(
						`Unable to fetch results: ${response.status} - ${response.statusText}`
					)
			})
			.then((results) => filterClipResults(criteria.title, criteria.created, results))
			.then((results) => {
				if (!results || !results.feed) {
					return { clips: [] }
				}

				const { entry } = results.feed

				const clips = (Array.isArray(entry) ? [...entry] : [entry]).filter((clip) => !!clip)

				return { clips: clips.map((clip) => mapClipData(clip, this.host)) }
			})
	}
}

function filterClipResults(title, created, results) {
	const now = new Date()

	const today = new Date(now)
	today.setHours(0, 0, 0, 0)

	const last7Days = new Date(now)
	last7Days.setHours(0, 0, 0, 0)
	last7Days.setDate(last7Days.getDate() - 1)

	const last30Days = new Date(now)
	last30Days.setHours(0, 0, 0, 0)
	last30Days.setDate(last7Days.getDate() - 30)

	const last365Days = new Date(now)
	last365Days.setHours(0, 0, 0, 0)
	last365Days.setDate(last365Days.getDate() - 365)

	const PERIOD_PRESETS = {
		TODAY: today.getTime(),
		LAST_7_DAYS: last7Days.getTime(),
		LAST_30_DAYS: last30Days.getTime(),
		LAST_365_DAYS: last365Days.getTime()
	}

	const nameFilter = new RegExp(title.replace(/\*+/gi, '[\\S]+'))

	return results.filter((clipInfo) => {
		if (clipInfo.time < PERIOD_PRESETS[created]) return false
		if (!clipInfo.name.match(nameFilter)) return false
		return true
	})
}

function mapClipData({ content }, serverHost) {
	if (!serverHost.endsWith('/')) {
		serverHost = `${serverHost}/`
	}

	return {
		path: content.path,
		title: content.name,
		size: content.size,
		created: new Date(content.time).toISOString(),
		thumbnailUrl: `${serverHost}${paths.STILLS}${content.name}`
	}
}
