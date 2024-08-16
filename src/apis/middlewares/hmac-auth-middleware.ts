import { createMiddleware } from 'hono/factory'

// hmac username="APP ID", algorithm="hmac-sha1", headers="x-date", signature="Base64(HMAC-SHA1("x-date: " + x-date , APP Key))"
// Wed, 19 Apr 2017 08:37:50 GMT

export const hmacAuth = () => createMiddleware(async (ctx, next) => {
	const authorization = ctx.req.header('Authorization')
	const xDate = ctx.req.header('X-Date')

	if (typeof authorization === 'undefined') {
		ctx.status(401)
	}

	if (typeof xDate === 'undefined') {
		ctx.status(401)
	}


})
