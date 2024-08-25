import { createRoute, z } from '@hono/zod-openapi'
import { sign } from '../../../../utils/jwt'
import { app } from '../../../../app'
import { cors } from '../../../../middlewares/cors'

interface SSOLoginRequest {
	type: string
	token: string
}

app.openapi(
	createRoute({
		middleware: [cors],
		method: 'post',
		path: '/api/v1/member/ssoLogin',
		request: {
			body: {
				description: '請求內容',
				content: {
					'application/json': {
						schema: z.object({
							type: z.string(),
							token: z.string()
						})
					}
				}
			}
		},
		responses: {
			200: {
				description: '成功',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string(),
							data: z.object({
								token: z.string()
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
			500: {
				description: '伺服器錯誤',
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
		const { type, token } = await c.req.json<SSOLoginRequest>()

		if (typeof type === 'undefined') return c.json({
			code: 1,
			message: '用戶端缺少必要參數: type'
		}, 400)

		if (typeof token === 'undefined') return c.json({
			code: 1,
			message: '用戶端缺少必要參數: token'
		}, 400)

		if (type !== 'schedule') return c.json({
			code: 1,
			message: '不支援的 SSO 登入模式'
		}, 400)

		const userId = await c.env.DB.prepare(`
			SELECT U.user_id AS userId
			FROM   TB_SCHEDULE S
				LEFT JOIN TB_PUNCH_IN P
						ON S.punch_in_id = P.punch_in_id
				LEFT JOIN TB_USER U
						ON P.user_id = U.user_id
			WHERE  S.schedule_token = ?1
				AND S.schedule_expiration_datetime < Datetime('now', 'localtime')`)
			.bind(token)
			.first<number>()

		if (userId === null) return c.json({
			code: 1,
			message: '查無用戶資訊'
		}, 400)

		const jwtToken = await sign(c.env, userId)

		return c.json({
			code: 0,
			message: '成功',
			data: {
				token: jwtToken
			}
		})
	}
)
