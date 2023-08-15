import Koa from 'koa'
import process from 'process'
import serve from 'koa-static'
import Router from 'koa-router'
import { createSearchAgent } from './agents/create-agent.mjs'

import packageInfo from '../package.json' assert { type: 'json' }

const app = new Koa()
const router = new Router()

const SERVER_PORT = process.env.PORT || 9000

const agent = createSearchAgent(process.env)

router.get('/api/search', async (ctx, next) => {
	ctx.set({
		'Content-Type': 'application/json',
		'Cache-Control': 'no-store',
		'Access-Control-Allow-Origin': '*'
	})

	try {
		ctx.body = JSON.stringify(
			await agent.searchClip({
				title: ctx.request.query['title'],
				created: ctx.request.query['created'],
				poolId: ctx.request.query['poolId']
			})
		)
	} catch (e) {
		ctx.status = 500
		ctx.body = JSON.stringify({ error: `Search failed: ${e}` })

		console.error(e)
	}

	next()
})

app
	.use(async (ctx, next) => {
		await next()

		ctx.set({
			Server: `${packageInfo.name}/${packageInfo.version}`
		})
	})
	.use(router.routes())
	.use(serve('./client/'))
	.listen(SERVER_PORT)

console.log(`Listening on port ${SERVER_PORT}`)
