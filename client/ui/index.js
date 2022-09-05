import { QuantelAgent } from '../agents/quantel/quantel-agent.js'
import { createQuantelClipNcsItem } from '../mos/ncsItemCreator.js'
import { dataAttributeNames as clipListItemAttributeNames } from '../components/clip-list-item.js'
import { init as initSearchForm, periodValueMap } from './search-form.js'
import { displaySearchResults } from './results.js'

export { init }

const DEFAULT_REFRESH_PERIOD = 10000 // ms

export const classNames = {
	CLIP_LIST: 'clip-list',
	CLIP_ITEM: 'clip-list--item'
}

let currentQuery = {}

/**
 * Performs a search on the Quantel Server using the query parameters from
 * the request querystring and creates a list of the items found.
 *
 * Sets up event listeneres for user interaction with the list, and calls
 * the given callbacks provided.
 *
 * @param {object} callbacks
 * @param {function} callbacks.onTargetSelect - called when user selects a clip
 * @param {function} callbacks.onTargetCancel - called when the user cancels a clip selection
 */
async function init({ onTargetSelect, onTargetCancel }) {
	const params = new URLSearchParams(document.location.search.substring(1))
	const server =
		params.get('server') || document.location.origin + document.location.pathname + 'api/'
	const titleQuery = params.get('title')
	const poolId = params.get('poolId')
	const createdQuery = params.get('created')
	const refreshAfter = params.get('refreshAfter')
		? Number(params.get('refreshAfter'))
		: DEFAULT_REFRESH_PERIOD

	const period = periodValueMap.get(createdQuery) || createdQuery // use valid preset if present

	const origin = params.get('origin')
	if (origin) {
		let originURL
		try {
			originURL = new URL(origin)
			document.domain = originURL.hostname
		} catch (e) {
			if (e.name === 'SecurityError' && originURL) {
				console.error(
					`Could not change document domain to "${originURL.hostname}" for provided origin URL: "${origin}"`,
					e
				)
			} else if (e.name === 'TypeError') {
				console.error(`Invalid origin URL: "${origin}"`, e)
			} else {
				console.error(e)
			}
		}
	}

	const quantelAgent = new QuantelAgent(server, poolId)

	initSearchForm(
		({ term, filter, period }) => {
			const title = `${filter ? filter : ''}*${term ? term + '*' : ''}`
			const query = { title, created: period }
			currentQuery = Object.assign({}, query)

			performSearch({ agent: quantelAgent, query }, refreshAfter)
		},
		{ titleQuery, period }
	)

	const query = { title: titleQuery, created: period }
	currentQuery = Object.assign({}, query)

	performSearch(
		{
			agent: quantelAgent,
			query
		},
		refreshAfter
	)

	setupDragTracking(classNames.CLIP_ITEM, {
		onDragStart: (clipItem, dataTransfer) => {
			try {
				const clipData = clipItem.dataset[clipListItemAttributeNames.CLIP]
				if (clipData) {
					const clip = JSON.parse(clipData)
					onTargetSelect(clip)

					const ncsItem = createQuantelClipNcsItem(clip)
					dataTransfer.setData('text', new XMLSerializer().serializeToString(ncsItem))
				}
			} catch (error) {
				console.error('Error while selecting clip', error)
			}
		},
		onDragEnd: (clipItem) => {
			const guid = clipItem.dataset[clipListItemAttributeNames.GUID]
			if (guid) {
				onTargetCancel()
			}
		}
	})

	setupFocusHandling()
	setupKeyHandling()

	return {
		origin
	}
}

/** Override some keyboard events, so that they don't trigger built-in browser behavior */
function setupKeyHandling() {
	document.addEventListener('keydown', (e) => {
		if (e.code === 'Escape') {
			// Allow the user to explicitly escape focus
			blurPlugin()
			e.preventDefault()
		} else if (e.code.match(/^F(\d+)$/)) {
			e.preventDefault()
		}
	})
}

/** This will inform the host application (we assume Sofie) that we may have hijacked the focus, and that it should
 * take the focus back.
 */
function setupFocusHandling() {
	document.addEventListener('focusout', (e) => {
		if (
			e.relatedTarget === null ||
			(e.relatedTarget.nodeName !== 'INPUT' &&
				e.relatedTarget.nodeName !== 'SELECT' &&
				e.relatedTarget.nodeName !== 'TEXTAREA')
		) {
			blurPlugin()
		}
	})
}

function blurPlugin() {
	window.parent &&
		window.parent.postMessage({
			id: `quantel-browser-plugin-${Date.now()}`,
			type: 'focus_in'
		})
}

function setupDragTracking(className, { onDragStart, onDragEnd }) {
	document.addEventListener('dragstart', ({ target, dataTransfer }) => {
		if (target.classList.contains(className)) {
			onDragStart(target, dataTransfer)
		}
	})

	document.addEventListener('dragend', ({ target }) => {
		if (target.classList.contains(className)) {
			onDragEnd(target)
		}
	})
}

async function performSearch({ agent, query }, refreshAfter) {
	try {
		const result = await agent.searchClip(query)

		if (isSameQuery(query, currentQuery)) {
			displaySearchResults(result.clips)
		}
	} catch (error) {
		console.log('Error while building clip list', error)
	}
	if (!Number.isNaN(refreshAfter) && refreshAfter > 0 && isSameQuery(query, currentQuery)) {
		setTimeout(performSearch, refreshAfter, { agent, query }, refreshAfter)
	}
}

function isSameQuery(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}
