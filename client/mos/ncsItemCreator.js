import { objectToXml } from '../xml/creator.js'

export { createQuantelClipNcsItem }

/**
 *
 * @param {object} clipData = the clip data to create the ncsItem from
 * @param {string} clipData.title - clip title
 * @param {string} clipData.guid - clip guid
 * @param {string} clipData.frames - clip length in frames
 * @param {string} clipData.timeBase - clip TimeBase (frames per second)
 *
 * @returns {XMLDocument} - a MOS ncsItem document
 */
function createQuantelClipNcsItem({ title, guid, frames, timeBase }) {
	return objectToXml(
		{
			ncsItem: {
				item: {
					itemID: 2,
					itemSlug: title,
					objID: guid,
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
							['#textContent']: guid
						}
					},
					itemEdStart: 0,
					itemEdDur: frames,
					mosExternalMetadata: {
						mosScope: 'OBJECT',
						mosPayload: {
							objType: 'VIDEO'
						}
					}
				}
			}
		},
		'mos'
	)
}
