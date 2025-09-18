import { type HonoEnv } from '../share'
import { createMiddleware } from 'hono/factory'
import { cors as honoCors } from 'hono/cors'

export const cors = createMiddleware<HonoEnv>(async (c, next) => {
	const corsOrigin = c.env.CORS_ORIGIN ?? '*'

	const corsMiddleware = honoCors({
		origin: corsOrigin,
		credentials: true,
		allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS']
	})

	return await corsMiddleware(c, next)
})
