import { periodPresets } from '../agents/quantel/quantel-agent.js'

export { init }

const elementNames = {
	FORM: 'searchForm',
	TITLE_INPUT: 'title',
	PERIOD_INPUT: 'period'
}

const classNames = {
	FILTER_CHECKBOX: 'category-toggle--checkbox'
}

const periodValueMap = {
	today: periodPresets.TODAY,
	week: periodPresets.LAST_7_DAYS,
	month: periodPresets.LAST_30_DAYS,
	year: periodPresets.LAST_365_DAYS
}

const filterValues = Array.from(
	document.forms[elementNames.FORM].querySelectorAll(`.${classNames.FILTER_CHECKBOX}`)
).map((checkbox) => checkbox.value)

function init(performSearch, { titleQuery }) {
	const { term, filter } = parseTitleQuery(titleQuery)

	const titleInput = document.forms[elementNames.FORM][elementNames.TITLE_INPUT]
	if (term) {
		titleInput.value = term
	}

	if (filter) {
		document.forms[elementNames.FORM]
			.querySelectorAll(`.${classNames.FILTER_CHECKBOX}`)
			.forEach((checkbox) => {
				checkbox.checked = filter === checkbox.value
			})
	}

	document.forms[elementNames.FORM].addEventListener('submit', (event) => {
		event.preventDefault()
		submitQuery(performSearch)
	})

	document.forms[elementNames.FORM].addEventListener('change', (event) => {
		const { target } = event

		if (target.isSameNode(titleInput)) {
			return // don't run a search for each character typed/erased, text search is handled on submit
		}

		if (target.classList.contains(classNames.FILTER_CHECKBOX)) {
			document.forms[elementNames.FORM]
				.querySelectorAll(`.${classNames.FILTER_CHECKBOX}`)
				.forEach((checkbox) => {
					if (!checkbox.isSameNode(target)) {
						checkbox.checked = target.value === checkbox.value
					}
				})
		}

		submitQuery(performSearch)
	})
}

function submitQuery(callback) {
	const term = document.forms[elementNames.FORM][elementNames.TITLE_INPUT].value || ''
	const category = document.forms[elementNames.FORM].querySelector(
		`.${classNames.FILTER_CHECKBOX}:checked`
	)

	const period =
		periodValueMap[document.forms[elementNames.FORM][elementNames.PERIOD_INPUT].value]

	callback({ term, filter: category?.value ?? null, period })
}

function parseTitleQuery(title) {
	if (typeof title !== 'string') {
		return {}
	}

	const result = title.split('*')

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
