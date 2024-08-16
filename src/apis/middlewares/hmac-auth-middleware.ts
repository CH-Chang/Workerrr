import { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

// hmac username="APP ID", algorithm="hmac-sha1", headers="x-date", signature="Base64(HMAC-SHA1("x-date: " + x-date , APP Key))"
// Wed, 19 Apr 2017 08:37:50 GMT

const hmacAuthGet = (ctx: Context): boolean => {
	const authorization = ctx.req.header('Authorization')
	const xDate = ctx.req.header('X-Date')

	return false
}

const hmacAuthPostAndPut = (ctx: Context): boolean => {
	const authorization = ctx.req.header('Authorization')
	const xDate = ctx.req.header('X-Date')

	return false
}

export const hmacAuth = () => createMiddleware(async (ctx, next) => {
	const authorization = ctx.req.header('Authorization')
	const xDate = ctx.req.header('X-Date')

	if (typeof authorization === 'undefined') {
		return ctx.status(401)
	}

	if (typeof xDate === 'undefined') {
		return ctx.status(401)
	}

	let auth = false
	switch (ctx.req.method) {
		case 'GET':
			auth = hmacAuthGet(ctx)
			break
		case 'POST':
			auth = hmacAuthPostAndPut(ctx)
			break
		case 'PUT':
			auth = hmacAuthPostAndPut(ctx)
			break
	}

	if (!auth) {
		return ctx.status(403)
	}

	await next()
})
