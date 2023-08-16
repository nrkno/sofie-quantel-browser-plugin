/**
 * Client side XML to JavaScript object conversion. Not exhaustive, might cut
 * corners to fit specific use cases.
 * Originally developed for use by the Quantel Browser Plugin in the Sofie TV Automation project.
 *
 * Note that this module relies on a globally available DOMParser, which
 * typically is a browser thing. For server side usage, xml2json is probably
 * what you want :)
 */
import parser from 'xml2json'
export { xmlStringToObject }

/**
 * Convenience function for conversion from XML source strings.
 */
function xmlStringToObject(xmlString) {
	return parser.toJson(xmlString, {
		object: true
	})
}

