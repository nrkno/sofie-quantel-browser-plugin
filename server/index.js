const Koa = require('koa');
const serve = require('koa-static');
const Router = require('koa-router');
const fetch = require('node-fetch');
const PassThrough = require('stream').PassThrough;

const app = new Koa();
const router = new Router();

const SERVER_PORT = process.env.PORT || 9000;

const QUANTEL_GW_URL = process.env.QUANTEL_GW_URL;

router.all('/api/(.*)', async (ctx, next) => {
	// console.log(ctx.request.method, ctx.params['0'], ctx.request.querystring);
	if (!QUANTEL_GW_URL) {
		ctx.body = 'Quantel Gateway not selected.';
		ctx.status = 502;
		next();

		return;
	}

	const method = ctx.request.method;
	const location = ctx.params['0'];
	const query = ctx.request.querystring;

	const href = `${QUANTEL_GW_URL}/${location}?${query}`;

	const response = await fetch(href, {
		method
	});
	ctx.set({
		'content-type': response.headers.get('content-type')
	});
	ctx.body = response.body.pipe(PassThrough());
	next();
});

app.use(router.routes());

app.use(serve('./client/'));

app.listen(SERVER_PORT);

console.log(`Listening on port ${SERVER_PORT}`);
