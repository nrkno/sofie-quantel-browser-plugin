import { QuantelAgent } from '../agents/quantel/quantel-agent.js'
import { createQuantelClipNcsItem } from '../mos/ncsItemCreator.js'
import {
	tagName as clipListItemTagName,
	dataAttributeNames as clipListItemAttributeNames
} from '../components/clip-list-item.js'
import { init as initSearchForm } from './search-form.js'

export { init }

const DEFAULT_REFRESH_PERIOD = 10000 // ms

const classNames = {
	CLIP_LIST: 'clip-list',
	CLIP_ITEM: 'clip-list--item'
}

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
	const server = params.get('server') || document.location.origin + '/api'
	const titleQuery = params.get('title')
	const poolId = params.get('poolId')
	const createdQuery = params.get('created')
	const refreshAfter = params.get('refreshAfter')
		? Number(params.get('refreshAfter'))
		: DEFAULT_REFRESH_PERIOD

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
			const created = period

			performSearch({ agent: quantelAgent, query: { title, created } })
		},
		{ titleQuery }
	)

	performSearch(
		{
			agent: quantelAgent,
			query: { title: titleQuery, created: createdQuery }
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

	return {
		origin
	}
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

function displaySearchResults(clips) {
	const resultsContainer = document.querySelector('.search-results')
	const newClipList = buildClipList(clips)
	const oldClipList = document.querySelector(`.${classNames.CLIP_LIST}`)
	if (oldClipList) {
		oldClipList.parentElement.replaceChild(newClipList, oldClipList)
	} else {
		resultsContainer.appendChild(newClipList)
	}
}

function buildClipList(clips) {
	const clipList = document.createElement('ol')
	clipList.classList.add(classNames.CLIP_LIST)
	clips.forEach((clip) => {
		const clipListelement = createClipListElement(clip)
		clipList.appendChild(clipListelement)
	})
	return clipList
}

function createClipListElement(clip) {
	const listItem = document.createElement('li', { is: `${clipListItemTagName}` })

	listItem.setAttribute('draggable', true)
	listItem.classList.add(classNames.CLIP_ITEM)
	listItem.dataset[clipListItemAttributeNames.GUID] = clip.guid
	listItem.dataset[clipListItemAttributeNames.CLIP] = JSON.stringify(clip)

	return listItem
}

function setHitCounter(hitCount) {
	document.querySelectorAll('.hit-counts--counter').forEach((counter) => {
		counter.textContent = hitCount
	})
}

async function performSearch({ agent, query }, refreshAfter) {
	try {
		const result = await agent.searchClip({ title: query.title })

		setHitCounter(result.clips.length)
		displaySearchResults(result.clips)
	} catch (error) {
		console.log('Error while building clip list', error)
	}
	if (!Number.isNaN(refreshAfter) && refreshAfter > 0) {
		setTimeout(performSearch, refreshAfter, { agent, query }, refreshAfter)
	}
}
