import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'

interface PunchInLogRow {
	punchInLogId: number
	punchInType: string
	punchInAccount: string
	punchInStatus: string
	punchInMemo: string
	punchInDatetime: string
}

app.openapi(
	createRoute({
		middleware: [authentication],
		method: 'get',
		path: '/api/v1/punchIn/log',
		request: {
			query: z.object({
				page: z.string().default('0'),
				pageCount: z.string().default('10')
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
							data: z.object({
								count: z.number(),
								punchInLogs: z.array(z.object({
									punchInLogId: z.number(),
									punchInType: z.string(),
									punchInAccount: z.string(),
									punchInStatus: z.string(),
									punchInMemo: z.string(),
									punchInDatetime: z.string()
								}))
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
		const pageString = c.req.query('page') ?? '0'
		const page = parseInt(pageString, 10)
		if (Number.isNaN(page)) return c.json({
			code: 1,
			message: '非法的頁碼'
		}, 400)

		const pageCountString = c.req.query('pageCount') ?? '10'
		const pageCount = parseInt(pageCountString, 10)
		if (Number.isNaN(pageCount)) return c.json({
			code: 1,
			message: '非法的單頁數量'
		}, 400)

		const userId = c.get('userId')

		const { count } = await c.env.DB
			.prepare(`
				SELECT Count(*) AS count
				FROM   TB_PUNCH_IN_LOG L
					LEFT JOIN TB_PUNCH_IN P
							ON L.punch_in_id = P.punch_in_id
				WHERE  P.user_id = ?1;`)
			.bind(userId)
			.first<{ count: number }>() ?? { count: 0 }

		const { success: punchInLogSuccess, results: punchInLogs } = await c.env.DB
			.prepare(`
				SELECT    L.punch_in_log_id   AS punchInLogId,
						P.punch_in_type     AS punchInType,
						P.punch_in_account  AS punchInAccount,
						L.punch_in_status   AS punchInStatus,
						L.punch_in_memo     AS punchInMemo,
						L.punch_in_datetime AS punchInDatetime
				FROM      TB_PUNCH_IN_LOG L
				LEFT JOIN TB_PUNCH_IN P
				ON        L.punch_in_id = P.punch_in_id
				WHERE     P.user_id = ?1
				ORDER BY  L.punch_in_datetime DESC LIMIT ?2 OFFSET (?3 * ?2);`)
			.bind(
				userId,
				pageCount,
				page - 1
			)
			.all<PunchInLogRow>()

		if (!punchInLogSuccess || count === null) return c.json({
			code: 1,
			message: '查詢過程發生錯誤'
		}, 500)

		return c.json({
			code: 0,
			message: '成功',
			data: {
				count,
				punchInLogs
			}
		})
	}
)
