import { QuantelAgent } from './quantel/quantel-agent.js'
import { CasparCGScannerAgent } from './casparcg-scanner/casparcg-scanner-agent.js'

function createSearchAgent(env) {
	switch (env.AGENT) {
		case 'casparcg':
			return new CasparCGScannerAgent(env.CASPARCG_SCANNER_URL)
		case 'quantel':
		default:
			return new QuantelAgent(env.QUANTEL_TRANSFORMER_URL)
	}
}

export { createSearchAgent }
