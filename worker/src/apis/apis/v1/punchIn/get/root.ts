import { createRoute, z } from '@hono/zod-openapi'
import { app } from '../../../../app'
import { authentication } from '../../../../middlewares/authorization'

interface PunchInRow {
	punchInId: number
	punchInType: string
	punchInAccount: string
	punchInEnable: string
	punchInManualType: string
}

app.openapi(
	createRoute({
		middleware: [authentication],
		method: 'get',
		path: '/api/v1/punchIn',
		responses: {
			200: {
				description: '成功',
				content: {
					'application/json': {
						schema: z.object({
							code: z.number(),
							message: z.string(),
							data: z.object({
								punchIns: z.array(z.object({
									punchInId: z.number(),
									punchInType: z.string(),
									punchInAccount: z.string(),
									punchInEnable: z.string(),
									punchInManualType: z.string()
								}))
							})
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

		const { success: punchInSuccess, results: punchIns } = await c.env.DB
			.prepare(`
				SELECT  P.punch_in_id                      AS punchInId,
						P.punch_in_type                    AS punchInType,
						P.punch_in_account                 AS punchInAccount,
						P.punch_in_enable                  AS punchInEnable,
						Ifnull(M.punch_in_manual_type, '') AS punchInManualType
					FROM   TB_PUNCH_IN P
						LEFT JOIN TB_PUNCH_IN_MANUAL M
								ON P.punch_in_id = M.punch_in_id
									AND M.punch_in_manual_date = Date('now', 'localtime')
					WHERE  P.user_id = ?1  `)
				.bind(userId)
				.all<PunchInRow>()

		if (!punchInSuccess) return c.json({
			code: 1,
			message: '查詢過程發生錯誤'
		}, 500)

		return c.json({
			code: 0,
			message: 'success',
			data: {
				punchIns
			}
		})
	}
)
