import { type HonoEnv } from '../share'
import { createMiddleware } from 'hono/factory'
import { verify } from '../utils/jwt'

const SKIP_AUTHORIZATION_PATHS = [
	'/api/v1/member/ssoLogin'
]

export const authentication = createMiddleware<HonoEnv>(async (c, next) => {
	const enableAuthorization = await c.env.KV.get('ENABLE_AUTHORIZATION')
	if (enableAuthorization !== 'true') {
		await next()
		return
	}

	if (SKIP_AUTHORIZATION_PATHS.includes(c.req.path)) {
		await next()
		return
	}

	const authorization = c.req.header('Authorization')
	if (typeof authorization === 'undefined') return c.json({
		code: 1,
		message: '缺少用戶驗證資訊'
	}, 401)

	const jwtToken = authorization.split(' ')[1]
	if (typeof jwtToken === 'undefined') return c.json({
		code: 1,
		message: '缺少用戶驗證資訊'
	}, 401)

	const userId = await verify(c.env, jwtToken)
	if (userId === null) return c.json({
		code: 1,
		message: '用戶驗證資訊無效'
	}, 403)

	c.set('userId', userId)
})
