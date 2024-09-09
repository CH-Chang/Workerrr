import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'
import { cors } from '../../../../middlewares/cors'
import { encrypt as aesEncrypt, decrypt as aesDecrypt } from '../../../../../share/utils/aes'
import { decrypt as rsaDecrypt } from '../../../../utils/rsa'

interface PunchInPasswordRequest {
	punchInId: number
	otpKey: string
	otp: string
	newPassword: string
}

app.openapi(
	createRoute({
		middleware: [cors, authentication],
		method: 'put',
		path: '/api/v1/punchIn/password',
		request: {
			body: {
				description: '請求內容',
				content: {
					'application/json': {
						schema: z.object({
							punchInId: z.number(),
							otpKey: z.string(),
							otp: z.string(),
							newPassword: z.string()
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
							message: z.string()
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
		const userId = c.get('userId')

		const { punchInId, newPassword, otp, otpKey } = await c.req.json<PunchInPasswordRequest>()

		const record = await c.env.DB
			.prepare(`
				SELECT COUNT(*) AS count
				FROM   TB_PUNCH_IN
				WHERE  punch_in_id = ?1
					AND user_id = ?2 `)
			.bind(punchInId, userId)
			.first<{ count: number }>() ?? { count: 0 }

		const recordCount = record.count
		if (recordCount <= 0) return c.json({
			code: 1,
			message: '查無打卡項目資料'
		}, 400)

		const otpRecord = await c.env.DB
			.prepare(`
				SELECT otp_argument AS otpArgument,
					   otp          AS otp
				FROM   TB_OTP
				WHERE  otp_key = ?1
					AND otp_purpose = ?2
					AND user_id = ?3
					AND otp_expiration_datetime < DATETIME('now') `)
			.bind(otpKey, 'punchIn', userId)
			.first<{ otpArgument: string, otp: string }>()

		if (otpRecord === null) return c.json({
			code: 1,
			message: '無效的一次性密碼'
		}, 400)

		const parsedOtpArgument = JSON.parse(otpRecord.otpArgument) as { punchInId: number }
		if (parsedOtpArgument.punchInId !== punchInId) return c.json({
			code: 1,
			message: '無效的一次性密碼'
		}, 400)

		if (otp !== otpRecord.otp) return c.json({
			code: 1,
			message: '錯誤的一次性密碼'
		}, 400)

		const decryptedNewPassword = await rsaDecrypt(c.env, newPassword)
		const encryptedRecordNewPassword = await aesEncrypt(c.env, decryptedNewPassword)

		const { success: updateSuccess } = await c.env.DB
			.prepare(`
				UPDATE TB_PUNCH_IN
				SET    punch_in_password = ?1
				WHERE  punch_in_id = ?2`)
			.bind(encryptedRecordNewPassword, punchInId)
			.run()

		if (!updateSuccess) return c.json({
			code: 1,
			message: '更新打卡密碼失敗'
		}, 500)

		return c.json({
			code: 0,
			message: '成功'
		}, 200)
	}
)
