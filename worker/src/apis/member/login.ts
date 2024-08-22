import { type Env } from '../../share'
import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../app'
import jwt from '@tsndr/cloudflare-worker-jwt'

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
				description: '成功回應內容',
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
			}
		}
	}),
	async (c) => {
		const token = await jwt.sign({
			id: 1,
			nbf: Math.floor(Date.now() / 1000) + (60 * 60),
			exp: Math.floor(Date.now() / 1000) + (2 * (60 * 60))
		}, 'secret')

		return c.json({
			code: 0,
			message: 'success',
			data: {
				token: token
			}
		})
	}
)
