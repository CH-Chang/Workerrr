import { createRoute, z } from '@hono/zod-openapi'
import { nanoid } from 'nanoid'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'
import { cors } from '../../../../middlewares/cors'
import dayjs from 'dayjs'

interface PunchInOtpRequest {
	punchInId: number
}

app.openapi(
	createRoute({
		middleware: [cors, authentication],
		method: 'post',
		path: '/api/v1/punchIn/otp',
		request: {
			body: {
				description: '請求內容',
				content: {
					'application/json': {
						schema: z.object({
							punchInId: z.number()
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
								otpKey: z.string()
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

		const { punchInId } = await c.req.json<PunchInOtpRequest>()

		const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
		const otpKey = nanoid()
		const otpExpiration = dayjs().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')
		const otpArgument = JSON.stringify({ punchInId })
		const otpType = 'Email'
		const otpPropose = 'punchIn'

		await c.env.DB
			.prepare(`
				INSERT INTO TB_OTP
							(user_id,
							otp_key,
							otp,
							otp_type,
							otp_purpose,
							otp_argument,
							otp_expiration_datetime)
				VALUES     (?1,
							?2,
							?3,
							?4,
							?5,
							?6,
							?7); `)
			.bind(userId, otpKey, otp, otpType, otpPropose, otpArgument, otpExpiration)
			.run()

		return c.json({
			code: 0,
			message: '成功',
			data: {
				otpKey
			}
		}, 200)
	}
)
