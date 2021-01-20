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
	DURATION: 'clip-element--duration',
	BTS: 'bts',
	STK: 'stk',
	VB: 'vb',
	VIGNETT: 'vignett',
	SUPER: 'super'
}

const template = html`
	<img class="${classNames.THUMBNAIL}" src="data:," alt="" />
	<span class="${classNames.LABEL}"></span>
	<span class="${classNames.DURATION}"></span>
`

class ClipListElement extends HTMLLIElement {
	constructor() {
		super()

		this.classList.add(classNames.ROOT)
		this.insertAdjacentHTML('afterbegin', template)
	}

	connectedCallback() {
		try {
			this.clip = JSON.parse(this.dataset[dataAttributeNames.CLIP])
			if (this.clip) {
				const { thumbnailUrl, thumbnailSet, title, frames, timeBase } = this.clip
				const thumbnail = this.querySelector(`.${classNames.THUMBNAIL}`)
				const label = this.querySelector(`.${classNames.LABEL}`)
				const duration = this.querySelector(`.${classNames.DURATION}`)

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

				duration.insertAdjacentHTML('afterbegin', formatDuration(frames, timeBase))
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

function formatDuration(frames, timeBase) {
	const framesNumber = new Number(frames)
	const timeBaseNumber = new Number(timeBase)

	const frameNum = framesNumber % timeBaseNumber
	const totalSeconds = framesNumber / timeBaseNumber
	const seconds = Math.floor(totalSeconds) % 60
	const minutes = Math.floor(totalSeconds / 60) % 60
	const hours = Math.floor(totalSeconds / 3600)

	return html`
		${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}<span style="font-size: 80%"
			>:${frameNum.toString().padStart(2, '0')}</span
		>
	`
}
