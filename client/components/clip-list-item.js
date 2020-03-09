const html = String.raw

export { tagName, dataAttributeNames }

const tagName = 'clip-list-element'

const dataAttributeNames = {
	CLIP: 'clip',
	GUID: 'guid'
}

const classNames = {
	ROOT: 'clip-element',
	LABEL: 'clip-element--label',
	THUMBNAIL: 'clip-element--thumbnail',
	BTS: 'bts',
	STK: 'stk',
	VB: 'vb',
	VIGNETT: 'vignett',
	SUPER: 'super'
}

const template = html`
	<img class="${classNames.THUMBNAIL}" src="data:," alt="" />
	<span class="${classNames.LABEL}"></span>
`

class ClipListElement extends HTMLLIElement {
	constructor() {
		super()

		this.classList.add(classNames.ROOT)
		this.innerHTML = template
	}

	connectedCallback() {
		try {
			this.clip = JSON.parse(this.dataset[dataAttributeNames.CLIP])
			if (this.clip) {
				const { thumbnailUrl, thumbnailSet, title } = this.clip
				const thumbnail = this.querySelector(`.${classNames.THUMBNAIL}`)
				const label = this.querySelector(`.${classNames.LABEL}`)

				thumbnail.src = thumbnailUrl
				thumbnail.srcset = Object.keys(thumbnailSet)
					.map((width) => {
						return `${thumbnailSet[width]} ${width}w`
					})
					.join(',')
				thumbnail.sizes = Object.keys(thumbnailSet)
					.map((width, idx, arr) => {
						if (idx < arr.length - 1) {
							// more or less reasonable viewport width calculation based on current styling,
							// taking into account horisontal margin and paddings
							const max = Number(width) * 3 + 36 + 32
							return `(max-width: ${max}px) ${width}px`
						} else {
							return `${width}px`
						}
					})
					.join(',')

				label.textContent = title
				label.classList.add(findLabelTypeClassName(title))
			}
		} catch (error) {
			console.error('Unable to create clip list item', error)
		}
	}
}
customElements.define(tagName, ClipListElement, { extends: 'li' })

function findLabelTypeClassName(clipTitle) {
	if (clipTitle.toLowerCase().startsWith('bts')) {
		return classNames.BTS
	}
	if (clipTitle.toLowerCase().startsWith('stk')) {
		return classNames.STK
	}
	if (clipTitle.toLowerCase().startsWith('vb')) {
		return classNames.VB
	}
	if (clipTitle.toLowerCase().startsWith('vignett')) {
		return classNames.VIGNETT
	}
	if (clipTitle.toLowerCase().startsWith('super')) {
		return classNames.SUPER
	}
}
