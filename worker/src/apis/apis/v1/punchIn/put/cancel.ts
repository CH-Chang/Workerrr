import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'
import { cors } from '../../../../middlewares/cors'
import dayjs from 'dayjs'

interface PunchInCancelRequest {
	date: string,
	punchInId: number
}

app.openapi(
	createRoute({
		middleware: [cors, authentication],
		method: 'put',
		path: '/api/v1/punchIn/cancel',
		request: {
			body: {
				description: '請求內容',
				content: {
					'application/json': {
						schema: z.object({
							date: z.string(),
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

		const { date, punchInId } = await c.req.json<PunchInCancelRequest>()

		const pDate = dayjs(date, 'YYYY-MM-DD', true)

		if (!pDate.isValid()) return c.json({
			code: 1,
			message: '非法的取消日期'
		}, 400)

		const { count } = (await c.env.DB
			.prepare(`
				SELECT COUNT(*) AS count
				FROM   TB_PUNCH_IN
				WHERE  user_id = ?1
					AND punch_in_id = ?2;`)
			.bind(userId, punchInId)
			.first<{ count: number }>()) ?? { count: 0 }

		if (count <= 0) return c.json({
			code: 1,
			message: '非法的取消打卡項目'
		}, 400)

		const { success: deleteSuccess } = await c.env.DB
			.prepare(`
				DELETE FROM TB_PUNCH_IN_MANUAL
				WHERE  punch_in_id = ?2
					AND punch_in_manual_date = Date('now', 'localtime');  `
			)
			.bind(userId, punchInId)
			.run()

		if (!deleteSuccess) return c.json({
			code: 1,
			message: '取消過程發生錯誤'
		}, 500)

		const { success: insertSuccess } = await c.env.DB
			.prepare(
				`INSERT INTO TB_PUNCH_IN_MANUAL
							(punch_in_id,
							punch_in_manual_date,
							punch_in_manual_type,
							punch_in_manual_argument)
				VALUES     (?1,
							?2,
							?3,
							?4);  `
			)
			.bind(
				punchInId,
				pDate.format('YYYY-MM-DD'),
				'Cancel',
				''
			)
			.run()

		if (!insertSuccess) return c.json({
			code: 1,
			message: '取消過程發生錯誤'
		}, 500)

		return c.json({
			code: 0,
			message: 'success'
		}, 200)
	}
)
