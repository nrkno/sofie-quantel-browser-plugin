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

const periodValueMap = new Map()
periodValueMap.set('today', periodPresets.TODAY)
periodValueMap.set('week', periodPresets.LAST_7_DAYS)
periodValueMap.set('month', periodPresets.LAST_30_DAYS)
periodValueMap.set('year', periodPresets.LAST_365_DAYS)

const filterValues = Array.from(
	document.forms[elementNames.FORM].querySelectorAll(`.${classNames.FILTER_CHECKBOX}`)
).map((checkbox) => checkbox.value)

function init(performSearch, { titleQuery, createdQuery }) {
	const { term, filter } = parseTitleQuery(titleQuery)
	const form = document.forms[elementNames.FORM]

	const titleInput = form[elementNames.TITLE_INPUT]
	if (term) {
		titleInput.value = term
	}

	// reflect period preselected via querystring in UI
	if (createdQuery) {
		for (const [key, value] of periodValueMap) {
			if (key === createdQuery || value === createdQuery) {
				const periodOptions = Array.from(form[elementNames.PERIOD_INPUT].options)
				const presetOptionIndex = periodOptions.findIndex((p) => p.value === key)
				form[elementNames.PERIOD_INPUT].selectedIndex = presetOptionIndex

				break
			}
		}
	}

	if (filter) {
		form.querySelectorAll(`.${classNames.FILTER_CHECKBOX}`).forEach((checkbox) => {
			checkbox.checked = filter === checkbox.value
		})
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault()
		submitQuery(performSearch)
	})

	form.addEventListener('change', (event) => {
		const { target } = event

		if (target.isSameNode(titleInput)) {
			return // don't run a search for each character typed/erased, text search is handled on submit
		}

		if (target.classList.contains(classNames.FILTER_CHECKBOX)) {
			form.querySelectorAll(`.${classNames.FILTER_CHECKBOX}`).forEach((checkbox) => {
				if (!checkbox.isSameNode(target)) {
					checkbox.checked = target.value === checkbox.value
				}
			})
		}

		submitQuery(performSearch)
	})
}

function submitQuery(callback) {
	const form = document.forms[elementNames.FORM]
	const term = form[elementNames.TITLE_INPUT].value || ''
	const category = form.querySelector(`.${classNames.FILTER_CHECKBOX}:checked`)
	const filter = category?.value && category?.value !== 'all-clips' ? category.value : null

	const period = periodValueMap.get(form[elementNames.PERIOD_INPUT].value)

	callback({ term, filter, period })
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
