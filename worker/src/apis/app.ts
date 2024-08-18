import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

export const app = new OpenAPIHono()

app.openapi(
	createRoute({
		method: 'get',
		path: '/',
		responses: {
			200: {
				description: '成功',
				content: {
					'application/json': {
						schema: z.object({
							message: z.string()
						})
					}
				}
			}
		}
	}),
	(c) => {
		return c.json({
			message: 'success'
		})
	}
)

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
