import { type HonoEnv } from '../share'
import { createMiddleware } from 'hono/factory'
import { cors as honoCors } from 'hono/cors'

export const cors = createMiddleware<HonoEnv>(async (c, next) => {
	const corsOrigin = await c.env.KV.get('CORS_ORIGIN') ?? '*'
	await honoCors({ origin: corsOrigin, credentials: true })(c, next)
})
