import { QuantelAgent } from './quantel/quantel-agent.mjs'
import { CasparCGScannerAgent } from './casparcg-scanner/casparcg-scanner-agent.mjs'

function createSearchAgent(env) {
	switch (env.AGENT) {
		case 'casparcg':
			if (!env.CASPARCG_SCANNER_URL || !env.CASPARCG_BASE_PATH)
				throw new Error(
					'CASPARCG_SCANNER_URL and CASPARCG_BASE_PATH environment variables need to be set'
				)
			return new CasparCGScannerAgent(env.CASPARCG_SCANNER_URL, env.CASPARCG_BASE_PATH)
		case 'quantel':
		default:
			if (!env.QUANTEL_TRANSFORMER_URL)
				throw new Error('QUANTEL_TRANSFORMER_URL environment variable needs to be set')
			return new QuantelAgent(env.QUANTEL_TRANSFORMER_URL)
	}
}

export { createSearchAgent }
