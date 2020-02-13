export { setSelected, clearSelected, getSelected }

let selected = null

function setSelected(guid) {
	if (guid) {
		selected = guid
	}
}

function clearSelected() {
	selected = null
}

function getSelected() {
	return selected
}
