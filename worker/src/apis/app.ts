import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { Env } from '../share'

export const app = new OpenAPIHono<{ Bindings: Env }>()

app.get(
	'/swagger',
	swaggerUI({
		url: '/doc'
	})
)

app.doc('/doc', {
	info: {
		title: 'Workerrr API',
		version: 'v1'
	},
	openapi: '3.1.0'
})
