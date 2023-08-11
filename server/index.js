const Koa = require('koa')
const serve = require('koa-static')
const Router = require('koa-router')
const fetch = require('node-fetch')
const PassThrough = require('stream').PassThrough
const { createSearchAgent } = require('./agents/create-agent.js')

const app = new Koa()
const router = new Router()

const SERVER_PORT = process.env.PORT || 9000

const QUANTEL_TRANSFORMER_URL = process.env.QUANTEL_TRANSFORMER_URL

const packageInfo = require('../package.json')

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
				created: ctx.request.query['created']
			})
		)
	} catch (e) {
		ctx.status = 500
		ctx.body = JSON.stringify({ error: `Search failed: ${e}` })

		console.error(e)
	}

	next()
})

router.all('/api/(.*)', async (ctx, next) => {
	// console.log(ctx.request.method, ctx.params['0'], ctx.request.querystring);
	if (!QUANTEL_TRANSFORMER_URL) {
		ctx.body = 'Quantel Transformer not selected.'
		ctx.status = 502
		next()

		return
	}

	const method = ctx.request.method
	const location = ctx.params['0']
	const query = ctx.request.querystring

	const href = `${QUANTEL_TRANSFORMER_URL}/${location}?${query}`

	try {
		const response = await fetch(href, {
			method
		})
		ctx.set({
			'Content-Type': response.headers.get('content-type'),
			'Cache-Control': response.headers.get('cache-control'),
			'Content-Length': response.headers.get('content-length'),
			'Access-Control-Allow-Origin': '*'
		})
		ctx.body = response.body.pipe(PassThrough())
	} catch (e) {
		ctx.status = 504
		ctx.body = 'Could not connect to remote Quantel Gateway'

		console.error(e)
	}

	next()
})

app.use(async (ctx, next) => {
	await next()

	ctx.set({
		Server: `${packageInfo.name}/${packageInfo.version}`
	})
})
	.use(router.routes())
	.use(serve('./client/'))
	.listen(SERVER_PORT)

console.log(`Listening on port ${SERVER_PORT}`)
