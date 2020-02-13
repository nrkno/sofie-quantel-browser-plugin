import { init as uiInit } from './ui/index.js'
import { setSelected, getSelected, clearSelected } from './state.js'

uiInit({
	onTargetCancel: (guid) => {
		clearSelected()
		console.log('Target cancel', guid, getSelected())
	},
	onTargetSelect: (guid) => {
		setSelected(guid)
		console.log('Target select', guid, getSelected())
	}
})
