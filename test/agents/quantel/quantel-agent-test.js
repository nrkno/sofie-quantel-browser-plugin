import { assert, refute, sinon } from '@sinonjs/referee-sinon'
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
			text: async () => sampleXmlResults,
			ok: true
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

			it('should use pool id given in constructor', async () => {
				const poolId = '6140'

				const agent = new QuantelAgent('http://quantel', poolId)
				await agent.searchClip('hehe')
				const actual = new URL(fetch.lastArg).searchParams.get('q')

				assert.contains(actual, `AND PoolID:${poolId}`)
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
				const serverUrl = 'http://quantel'
				const agent = new QuantelAgent(serverUrl)

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

				it('should set title property from clip data', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const actual = (await results).clips[0].frames

					assert.equals(actual, '0')
				})

				it('should set clipId property from clip data', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const actual = (await results).clips[0].clipId

					assert.equals(actual, '699991')
				})

				it('should set thumbnailUrl property to a still for the clip', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const clipId = (await results).clips[0].clipId
					const expected = `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.128.jpg`

					const actual = (await results).clips[0].thumbnailUrl

					assert.equals(actual, expected)
				})

				it('should set the thumbnailSet property to a mapped array of stills for different sizes', async () => {
					const results = agent.searchClip('whatever') // fetch mock doesn't care
					const clipId = (await results).clips[0].clipId
					const expected = {
						128: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.128.jpg`,
						256: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.256.jpg`,
						384: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.384.jpg`,
						512: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.512.jpg`
					}

					const actual = (await results).clips[0].thumbnailSet

					assert.match(actual, expected)
				})

				it('should set updated property from clip data', async () => {
					const results = agent.searchClip('whatever')

					const actual = (await results).clips[0].updated

					assert.match(actual, `2020-02-11T14:11:34.000+01:00`)
				})
			})
		})

		describe('Error handling', () => {
			it('should throw on HTTP 500', async () => {
				const fetch = sinon.fake.resolves({
					text: async () => sampleXmlResults,
					ok: false,
					status: 500,
					statusText: 'Internal server error'
				})
				global.window.fetch = fetch
				global.fetch = fetch

				const agent = new QuantelAgent('http://quantel')

				try {
					await agent.searchClip('whatever')
					refute(true, 'Should have thrown')
				} catch (err) {
					// success!
				}
			})
		})
	})

	afterEach(() => {
		sinon.restore()
	})
})
