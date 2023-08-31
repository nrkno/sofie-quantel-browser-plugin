import { jest, expect } from '@jest/globals'
import * as url from 'node:url'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const sampleXmlResults = await fs.readFile(
	path.join(__dirname, 'clip-search-query-zzz.xml'),
	'utf-8'
)

jest.unstable_mockModule('node-fetch', async () => {
	return {
		__esModule: true,
		default: jest.fn()
	}
})

const { QuantelAgent } = await import('../quantel-agent.mjs')
const nodeFetch = await import('node-fetch')
const fetch = jest.mocked(nodeFetch)

describe('Quantel Agent', () => {
	beforeEach(() => {
		fetch.default.mockClear()
		fetch.default.mockImplementation(async () => ({
			text: async () => sampleXmlResults,
			ok: true
		}))
	})

	describe('searchClip', () => {
		describe('Query to Quantel server', () => {
			it('should query host given in constructor', async () => {
				const hostUrl = new URL('http://quantel')

				const agent = new QuantelAgent(hostUrl.href)
				await agent.searchClip({ title: 'hehe' })
				const actual = new URL(fetch.default.mock.calls[0][0])

				expect(actual.protocol).toBe(hostUrl.protocol)
				expect(actual.host).toBe(hostUrl.host)
			})

			it('should use pool id given in the query', async () => {
				const poolId = '6140'

				const agent = new QuantelAgent('http://quantel', poolId)
				await agent.searchClip({ title: 'hehe', poolId })
				const actual = new URL(fetch.default.mock.calls[0][0]).searchParams.get('q')

				expect(actual).toContain(`AND PoolID:${poolId}`)
			})

			it('should query using the correct path', async () => {
				const agent = new QuantelAgent('http://quantel')
				await agent.searchClip({ title: 'hehe' })

				const actual = new URL(fetch.default.mock.calls[0][0])
				expect(actual.pathname).toBe('/quantel/homezone/clips/search')
			})
			it('should query using the provided title', async () => {
				const title = 'hehelol'
				const expected = `Title:${title}`

				const agent = new QuantelAgent('http://quantel')
				await agent.searchClip({ title })

				const actual = new URL(fetch.default.mock.calls[0][0])
				expect(actual.searchParams.get('q')).toContain(expected)
			})
		})

		describe('Return value', () => {
			it('should return an array containing the clips from the search results', async () => {
				const agent = new QuantelAgent('http://quantel')
				const actual = await agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care

				expect(Array.isArray(actual.clips)).toBe(true)
				expect(actual.clips.length).toBe(3)
			})

			describe('Clip object contents', () => {
				const serverUrl = 'http://quantel'
				const agent = new QuantelAgent(serverUrl)

				it('should set guid property from clip data', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const actual = (await results).clips[0].guid

					expect(actual).toBe('e24c1fee-6709-41ea-8577-736f27674623')
				})

				it('should set title property from clip data', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const actual = (await results).clips[0].title

					expect(actual).toBe('zzz-Espen-headling-110220-dr12')
				})

				it('should set title property from clip data', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const actual = (await results).clips[0].frames

					expect(actual).toBe('0')
				})

				it('should set clipId property from clip data', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const actual = (await results).clips[0].clipId

					expect(actual).toBe('699991')
				})

				it('should set created property from clip data', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const actual = (await results).clips[0].created

					expect(actual).toBe('2020-02-11T14:11:34.000+01:00')
				})

				it('should set thumbnailUrl property to a still for the clip', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const clipId = (await results).clips[0].clipId
					const expected = `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.128.jpg`

					const actual = (await results).clips[0].thumbnailUrl

					expect(actual).toBe(expected)
				})

				it('should set the thumbnailSet property to a mapped array of stills for different sizes', async () => {
					const results = agent.searchClip({ title: 'whatever' }) // fetch mock doesn't care
					const clipId = (await results).clips[0].clipId
					const expected = {
						128: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.128.jpg`,
						256: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.256.jpg`,
						384: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.384.jpg`,
						512: `${serverUrl}/quantel/homezone/clips/stills/${clipId}/0.512.jpg`
					}

					const actual = (await results).clips[0].thumbnailSet

					expect(actual).toMatchObject(expected)
				})
			})
		})

		describe('Error handling', () => {
			it('should throw on HTTP 500', async () => {
				fetch.default.mockImplementation(async () => ({
					text: async () => sampleXmlResults,
					ok: false,
					status: 500,
					statusText: 'Internal server error'
				}))

				const agent = new QuantelAgent('http://quantel')

				await expect(agent.searchClip({ title: 'whatever' })).rejects.toThrow()
			})

			afterAll(() => {
				fetch.default.mockReset()
			})
		})
	})
})

