import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'

interface PunchInLogRequest {
	type: string
	token: string
}

app.openapi(
	createRoute({
		middleware: [authentication],
		method: 'get',
		path: '/api/v1/punchIn',
		responses: {
			200: {
				description: '成功',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string(),
							data: z.array(z.object({
							}))
						})
					}
				}
			},
			401: {
				description: '用戶端錯誤',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string()
						})
					}
				}
			},
			403: {
				description: '用戶端錯誤',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string()
						})
					}
				}
			}
		}
	}),
	async (c) => {
		return c.json({
			code: 0,
			message: 'success',
			data: []
		})
	}
)
