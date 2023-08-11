import { QuantelAgent } from './quantel/quantel-agent.js'

function createSearchAgent(env) {
	return new QuantelAgent()
}

export { createSearchAgent }
