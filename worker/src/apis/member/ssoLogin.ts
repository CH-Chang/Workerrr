import { type Env } from '../../share'
import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../app'
import jwt from '@tsndr/cloudflare-worker-jwt'

interface SSOLoginRequest {
	type: string
	token: string
}

app.openapi(
	createRoute({
		method: 'post',
		path: '/ssoLogin',
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
		const kv = c.env.KV
		const db = c.env.DB

		const secret = await kv.get('JWT_SECRET')

		if (secret === null) return c.json({
			code: 1,
			message: '伺服器未配置 JWT 密鑰資訊'
		}, 500)

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

		const userId = await db.prepare(`
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


		const jwtToken = await jwt.sign({
			userId,
			nbf: Math.floor(Date.now() / 1000) + (60 * 60),
			exp: Math.floor(Date.now() / 1000) + (2 * (60 * 60))
		}, secret)

		return c.json({
			code: 0,
			message: 'success',
			data: {
				token: jwtToken
			}
		})
	}
)
