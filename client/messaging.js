import { xmlStringToObject } from './xml/parser.js'
import { getObjectType, objectTypes } from './mos/mos-helpers.js'
import { ncsReqAppInfo } from './mos/ncsReqAppInfo.js'

export { initListeners, signalReadyToHost, sendData, sendXmlData }

/**
 * Initialize messaging event listeners.
 *
 * @param {string} hostOrigin - allowed origin for MOS messages
 * @param {Object} callbacks - callbacks for incoming messages
 * @param {function} onNcsItemRequest - callback for a MOS NcsItemRequest
 */
function initListeners(hostOrigin, { onNcsItemRequest, onNcsAppInfo }) {
	window.addEventListener('message', ({ data, origin }) => {
		if (event.origin !== hostOrigin) {
			console.log(`Received a message with incorrect origin: "${origin}"`)
			return
		}

		try {
			const obj = xmlStringToObject(data)
			const messageType = getObjectType(obj)
			switch (messageType) {
				case objectTypes.MOS_NCS_ITEM_REQUEST:
					onNcsItemRequest()
					break
				case objectTypes.MOS_NCS_APP_INFO:
					onNcsAppInfo(obj)
					break
			}
		} catch (error) {
			console.log('Discarded incoming message (unable to parse):', data)
		}
	})
}

/**
 * Signal that we are ready to receive messages
 */
function signalReadyToHost() {
	if (window.parent && window.parent !== window) {
		sendXmlData(window.parent, ncsReqAppInfo())
	}
}

/**
 * Sends an XML payload to a specified window.
 *
 * @param {Window} targetWindow - the window the data will be sent to
 * @param {Document} xmlData - the data payload to send
 */
function sendXmlData(targetWindow, xmlData) {
	targetWindow.postMessage(new XMLSerializer().serializeToString(xmlData), '*')
}

/**
 * Sends a data payload to a specified window.
 *
 * @param {Window} targetWindow - the window the data will be sent to
 * @param {string} data - the data payload to send
 */
function sendData(targetWindow, data) {
	targetWindow.postMessage(data, '*')
}
