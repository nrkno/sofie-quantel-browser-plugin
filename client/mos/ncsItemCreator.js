import { objectToXml } from '../xml/creator.js'

export { createQuantelClipNcsItem }

/**
 *
 * @param {object} clipData = the clip data to create the ncsItem from
 * @param {string} clipData.title - clip title
 * @param {string} clipData.guid - clip guid
 * @param {string} clipData.frames - clip length in frames
 * @param {string} clipData.timeBase - clip TimeBase (frames per second)
 * @param {string} clipData.owner - clip owner
 *
 * @returns {XMLDocument} - a MOS ncsItem document
 */
function createQuantelClipNcsItem({ title, guid, path, frames, timeBase, owner }) {
	return objectToXml(
		{
			ncsItem: {
				item: {
					itemID: 2,
					itemSlug: title,
					objID: guid ?? objIdFromPath(path),
					objSlug: title,
					objDur: frames,
					objTB: timeBase,
					mosID: 'quantelplugin.sofie',
					mosPlugInID: 'Sofie.QuantelPlugin',
					mosAbstract: {
						['#textContent']: title
					},
					objPaths: {
						objPath: {
							['@techDescription']: 'VIDEO',
							['#textContent']: guid ?? path
						}
					},
					itemEdStart: 0,
					itemEdDur: frames,
					mosExternalMetadata: {
						mosScope: 'OBJECT',
						mosSchema: 'urn:sofie:quantel',
						mosPayload: {
							objType: 'VIDEO',
							owner: owner
						}
					}
				}
			}
		},
		'mos'
	)
}

function objIdFromPath(str) {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash &= hash // Convert to 32bit integer
	}
	return new Uint32Array([hash])[0].toString(36)
}
