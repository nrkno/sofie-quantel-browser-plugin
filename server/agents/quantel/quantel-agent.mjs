import fetch from 'node-fetch'
import { xmlStringToObject } from '../../xml/parser.mjs'
export { QuantelAgent }

const paths = {
	SEARCH: 'quantel/homezone/clips/search',
	STILLS: 'quantel/homezone/clips/stills/'
}

const REQUESTS = {
	CLIP_SEARCH: {
		path: paths.SEARCH,
		params: {
			QUERY: 'q'
		}
	}
}

const PERIOD_PRESETS = {
	TODAY: '[NOW-1DAY/DAY TO NOW]',
	LAST_7_DAYS: '[NOW-7DAY/DAY TO NOW]',
	LAST_30_DAYS: '[NOW-30DAY/DAY TO NOW]',
	LAST_365_DAYS: '[NOW-365DAY/DAY TO NOW]'
}

/** Agent for quering a Quantel media server */
class QuantelAgent {
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
	 * @param {string} criteria.poolId - scope the search to a specified pool
	 *
	 * @returns {Promise} - a promise containing the search results
	 */

	searchClip(criteria) {
		const { path, params } = REQUESTS.CLIP_SEARCH

		const url = new URL(this.host)
		url.pathname = url.pathname + path
		const queryParamValue = buildQueryParam(
			Object.assign(
				{},
				{
					title: criteria.title,
					created: PERIOD_PRESETS[criteria.created] ?? PERIOD_PRESETS.TODAY
				},
				criteria.poolId
					? {
							poolId: criteria.poolId
					  }
					: {}
			)
		)
		url.searchParams.append(params.QUERY, queryParamValue)

		return fetch(url.href)
			.then((response) => {
				if (response.ok) {
					return response.text()
				} else
					throw new Error(
						`Unable to fetch results: ${response.status} - ${response.statusText}`
					)
			})
			.then(xmlStringToObject)
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

function mapClipData({ content }, serverHost) {
	if (!serverHost.endsWith('/')) {
		serverHost = `${serverHost}/`
	}

	return {
		guid: content.ClipGUID,
		title: content.Title,
		frames: content.Frames,
		timeBase: content.ServerFrameRate,
		owner: content.Owner,
		clipId: content.ClipID,
		created: content.Created,
		thumbnailUrl: `${serverHost}${paths.STILLS}${content.ClipID}/0.128.jpg`,
		thumbnailSet: buildThumbnailSrcSet({
			serverHost,
			clipId: content.ClipID,
			sizes: [128, 256, 384, 512]
		})
	}
}

function buildQueryParam({ title, poolId, created }) {
	const titleFragment = `Title:${title || '*'}`
	const poolIdFragment = poolId ? ` AND PoolID:${poolId}` : ''
	const createdFragment = created ? ` AND Created:${created}` : ''

	return `${titleFragment}${poolIdFragment}${createdFragment}`
}

function buildThumbnailSrcSet({ serverHost, clipId, sizes }) {
	if (!serverHost.endsWith('/')) {
		serverHost = `${serverHost}/`
	}

	const srcSet = {}
	sizes.forEach((size) => {
		const url = `${serverHost}${paths.STILLS}${clipId}/0.${size}.jpg`
		srcSet[size] = url
	})

	return srcSet
}
