import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'
import { cors } from '../../../../middlewares/cors'
import { encrypt as aesEncrypt, decrypt as aesDecrypt } from '../../../../utils/aes'
import { decrypt as rsaDecrypt } from '../../../../utils/rsa'

interface PunchInPasswordRequest {
	punchInId: number
	password: string
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
							password: z.string(),
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
			}
		}
	}),
	async (c) => {
		const userId = c.get('userId')

		const { punchInId, password, newPassword } = await c.req.json<PunchInPasswordRequest>()

		const recordPasswords = await c.env.DB
			.prepare(`
				SELECT punch_in_password AS punchInPassword
				FROM   TB_PUNCH_IN
				WHERE  punch_in_id = ?1
					AND user_id = ?2 `)
			.bind(punchInId, userId)
			.first<{ punchInPassword: string }>() ?? { punchInPassword: '' }

		const recordPassword = recordPasswords.punchInPassword
		if (recordPassword === '') return c.json({
			code: 1,
			message: '查無打卡項目資料'
		}, 400)

		const decryptedPassword = await rsaDecrypt(c.env, password)
		const decryptedRecordPassword = await aesDecrypt(c.env, recordPassword)
		if (decryptedPassword !== decryptedRecordPassword) return c.json({
			code: 1,
			message: '舊密碼不符'
		}, 200)

		const decryptedNewPassword = await rsaDecrypt(c.env, newPassword)
		const encryptedRecordNewPassword = await aesEncrypt(c.env, decryptedNewPassword)

		await c.env.DB
			.prepare(`
				UPDATE TB_PUNCH_IN
				SET    punch_in_password = ?1
				WHERE  punch_in_id = ?2`)
			.bind(encryptedRecordNewPassword, punchInId)
			.run()

		return c.json({
			code: 0,
			message: '成功'
		}, 200)
	}
)
