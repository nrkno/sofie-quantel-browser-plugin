import { init as uiInit } from './ui/index.js'
import { setSelected, getSelected, clearSelected } from './state.js'
import {
	initListeners as messagingInitListeners,
	signalReadyToHost as messagingSignalReady,
	sendXmlData
} from './messaging.js'
import { createQuantelClipNcsItem } from './mos/ncsItemCreator.js'

uiInit({
	onTargetCancel: () => {
		const cleared = clearSelected()
		console.log('Target cancel', cleared.guid, getSelected())
	},
	onTargetSelect: (clip) => {
		setSelected(clip)
		console.log('Target select', clip.guid, getSelected())
	}
}).then(({ origin }) => {
	messagingInitListeners(origin, {
		onNcsItemRequest: () => {
			const selected = getSelected()
			if (selected && window.parent) {
				const ncsItem = createQuantelClipNcsItem(selected)
				sendXmlData(window.parent, ncsItem)
			}
		},
		onNcsAppInfo: (obj) => {
			console.log(obj)
		}
	})

	messagingSignalReady()
})
