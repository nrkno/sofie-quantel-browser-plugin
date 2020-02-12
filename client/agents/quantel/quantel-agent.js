import { xmlStringToObject } from './parser.js'

export { QuantelAgent }

const REQUESTS = {
	CLIPS: {
		path: '/quantel/homezone/clips/search',
		params: {
			QUERY: 'q'
		}
	}
}

class QuantelAgent {
	constructor(host) {
		this.host = host
	}

	searchClip(query) {
		const { path, params } = REQUESTS.CLIPS
		const url = new URL(this.host)
		url.pathname = path
		url.searchParams.append(params.QUERY, query)
		return fetch(url.href)
			.then((response) => response.text())
			.then((xmlString) => xmlStringToObject(xmlString))
			.then((results) => {
				const clips = Array.isArray(results.entry) ? [...results.entry] : [results.entry]

				return { clips: clips.map(mapClipData) }
			})
	}
}

function mapClipData({ content }) {
	return {
		guid: content.ClipGUID,
		title: content.Title
	}
}
