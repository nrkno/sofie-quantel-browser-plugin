import { assert, sinon } from '@sinonjs/referee-sinon'
import { QuantelAgent } from '../../../client/agents/quantel/quantel-agent.js'
import { readFileSync } from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const sampleXmlResults = readFileSync(path.join(__dirname, 'clip-search-query-zzz.xml'), 'utf-8')

describe('Quantel Agent', () => {
	before(() => {
		const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>')

		global.window = dom.window
		global.document = dom.window.document
		const fetch = sinon.fake.resolves({
			text: async () => sampleXmlResults
		})
		global.window.fetch = fetch
		global.fetch = fetch
	})

	describe('searchClip', () => {
		describe('Query to Quantel server', () => {
			it('should query host given in constructor', async () => {
				const hostUrl = new URL('http://quantel')

				const agent = new QuantelAgent(hostUrl.href)
				await agent.searchClip('hehe')
				const actual = new URL(fetch.lastArg)

				assert.equals(actual.protocol, hostUrl.protocol)
				assert.equals(actual.host, hostUrl.host)
			})

			it('should query using the correct path', async () => {
				const agent = new QuantelAgent('http://quantel')
				await agent.searchClip('hehe')

				const actual = new URL(fetch.lastArg)
				assert.equals(actual.pathname, '/quantel/homezone/clips/search')
			})
			it('should query using the provided title', async () => {
				const title = 'hehelol'
				const expected = `Title:${title}`

				const agent = new QuantelAgent('http://quantel')
				await agent.searchClip({ title: title })

				const actual = new URL(fetch.lastArg)
				assert.equals(actual.searchParams.get('q'), expected)
			})
		})

		describe('Return value', () => {
			it('should return an array containing the clips from the search results', async () => {
				const agent = new QuantelAgent('http://quantel')
				const actual = await agent.searchClip('whatever') // fetch mock doesn't care

				assert.isArray(actual.clips)
				assert.equals(actual.clips.length, 3)
			})

			describe('Clip object contents', () => {
				const agent = new QuantelAgent('http://quantel')

				it('should set guid property from clip data', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const actual = (await results).clips[0].guid

					assert.equals(actual, 'e24c1fee-6709-41ea-8577-736f27674623')
				})

				it('should set title property from clip data', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const actual = (await results).clips[0].title

					assert.equals(actual, 'zzz-Espen-headling-110220-dr12')
				})
			})
		})
	})

	afterEach(() => {
		sinon.restore()
	})
})
