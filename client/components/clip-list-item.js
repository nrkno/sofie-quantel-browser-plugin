const html = String.raw

export { tagName, dataAttributeNames }

const tagName = 'clip-list-element'

const dataAttributeNames = {
	CLIP: 'clip',
	GUID: 'guid'
}

const classNames = {
	LABEL: 'clip-list-element--label',
	THUMBNAIL: 'clip-list-element--thumbnail'
}

const template = html`
	<img class="${classNames.THUMBNAIL}" src="data:," alt="" />
	<span class="${classNames.LABEL}"></span>
`

class ClipListElement extends HTMLLIElement {
	constructor() {
		super()

		// const shadowRoot = this.attachShadow({ mode: 'open' })
		this.innerHTML = template
	}

	connectedCallback() {
		try {
			this.clip = JSON.parse(this.dataset[dataAttributeNames.CLIP])
			if (this.clip) {
				const { thumbnailUrl, title } = this.clip
				const thumbnail = this.querySelector(`.${classNames.THUMBNAIL}`)
				const label = this.querySelector(`.${classNames.LABEL}`)

				thumbnail.src = thumbnailUrl
				thumbnail.setAttribute('alt', `Still frame for ${title}`)

				label.textContent = title
			}
		} catch (error) {
			console.error('Unable to create clip list item', error)
		}
	}
}
customElements.define(tagName, ClipListElement, { extends: 'li' })
