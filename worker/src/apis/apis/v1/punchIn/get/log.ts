import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'

app.openapi(
	createRoute({
		middleware: [authentication],
		method: 'get',
		path: '/api/v1/punchIn/log',
		request: {
			query: z.object({
				page: z.string().default('0')
			})
		},
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
			400: {
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
		const pageString = c.req.query('page') ?? '0'
		const page = parseInt(pageString, 10)
		if (Number.isNaN(page)) return c.json({
			code: 0,
			message: '非法的頁碼'
		}, 400)

		return c.json({
			code: 0,
			message: 'success',
			data: []
		})
	}
)
