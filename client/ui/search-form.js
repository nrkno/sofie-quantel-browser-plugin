export { init }

const names = {
	FORM: 'searchForm',
	TITLE: 'title',
	PERIOD: 'period',
	VIGNETT: 'vignett',
	SUPER: 'super',
	VB: 'vb',
	BTS: 'bts',
	STK: 'stk'
}

const classNames = {
	FILTER_CHECKBOX: 'category-toggle'
}

const filterValues = [names.VIGNETT, names.SUPER, names.VB, names.BTS, names.STK].map(
	(name) => document.forms[names.FORM][name].value
)

function init(performSearch, { titleQuery }) {
	const { term, filter } = parseTitleQuery(titleQuery)
	console.log(`term: ${term}, filter: ${filter}`)

	const titleInput = document.forms[names.FORM][names.TITLE]
	if (term) {
		titleInput.value = term
	}

	if (filter) {
		document
			.querySelectorAll(`.${classNames.FILTER_CHECKBOX} input[type=checkbox]`)
			.forEach((checkbox) => {
				console.log(checkbox)
				if (filter === checkbox.value) {
					checkbox.setAttribute('checked', 'checked')
				}
				console.log(checkbox)
			})
	}

	document.forms[names.FORM].addEventListener('submit', (event) => {
		event.preventDefault()
		submitQuery(performSearch)
	})

	document.forms[names.FORM].addEventListener('change', (event) => {
		const { target } = event
		if (!target.isSameNode(titleInput)) {
			submitQuery(performSearch)
		}
	})
}

function submitQuery(callback) {
	const term = document.forms[names.FORM][names.TITLE].value || ''
	const category = document.forms[names.FORM].querySelector(
		`.${classNames.FILTER_CHECKBOX}:checked`
	)
	const period = document.forms[names.FORM][names.PERIOD].value

	callback({ term, filter: category ? category.value : null, period })
}

function parseTitleQuery(title) {
	if (typeof title !== 'string') {
		return {}
	}

	const result = title.split('*')
	console.log(result)
	if (result && filterValues.indexOf(result[0]) > -1) {
		return {
			filter: result[0],
			term: result[1] || null
		}
	}

	if (filterValues.indexOf(title) > -1) {
		return { filter: title }
	}

	return { term: title }
}
