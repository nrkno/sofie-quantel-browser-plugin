import {
	tagName as clipListItemTagName,
	dataAttributeNames as clipListItemAttributeNames
} from '../components/clip-list-item.js'

import { classNames } from './index.js'

export { displaySearchResults }

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