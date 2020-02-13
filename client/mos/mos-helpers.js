import { create as createNcsItem } from './ncsItemCreator.js'
import { xmlStringToObject } from '../xml/parser.js'

export { parseXmlString }

const messageTypes = {
	MOS_NCS_ITEM_REQUEST: 'ncsItemRequest',
	CLIP_ITEM: 'mos-clip-item',
	NOT_MOS: 'non-mos',
	MOS_UNKNOWN: 'mos-unknown'
}

function parseXmlString(xmlString) {
	const obj = xmlStringToObject(xmlString)
	const type = getMessageType(obj)

	return { type }
}

function getMessageType(obj) {
	if (Object.keys(obj)[0] !== 'mos') {
		// not a mos object
		return messageTypes.NOT_MOS
	}

	switch (Object.keys(obj.mos)[0]) {
		case messageTypes.MOS_NCS_ITEM_REQUEST:
			return messageTypes.MOS_NCS_ITEM_REQUEST
		default:
			return messageTypes.MOS_UNKNOWN
	}
}

function getMosObjectCreator(type) {
	switch (type) {
		case messageTypes.CLIP_ITEM:
			return createNcsItem
	}
}
