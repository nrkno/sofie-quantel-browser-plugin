import { objectToXml } from '../xml/creator.js'
export { ncsReqAppInfo }

function ncsReqAppInfo() {
	return objectToXml(
		{
			ncsReqAppInfo: null
		},
		'mos'
	)
}
