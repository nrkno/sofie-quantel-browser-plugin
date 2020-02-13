export { init }

function init() {
	window.addEventListener('message', ({ data, origin, source }) => {
		console.log('Incoming transmission', origin, data)
	})
}
