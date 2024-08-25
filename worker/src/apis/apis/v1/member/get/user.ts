import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'
import { cors } from '../../../../middlewares/cors'

interface UserRow {
	userId: string
	name: string
	account: string
	email: string
}

app.openapi(
	createRoute({
		middleware: [cors, authentication],
		method: 'get',
		path: '/api/v1/member/user',
		responses: {
			200: {
				description: '成功',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string(),
							data: z.object({
								userId: z.string(),
								name: z.string(),
								account: z.string(),
								email: z.string()
							})
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
		const userId = c.get('userId')

		const user = await c.env.DB
			.prepare(`
				SELECT user_id AS userId,
						account AS account,
						name    AS name,
						email   AS email
				FROM   TB_USER
				WHERE  user_id = ?1;  `)
			.bind(
				userId
			)
			.first<UserRow>()

		if (user === null) return c.json({
			code: 1,
			message: '查無用戶'
		}, 400)

		return c.json({
			code: 0,
			message: '成功',
			data: {
				...user
			}
		})
	}
)
