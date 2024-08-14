import { type Env } from '../share'
import { type PunchInRow } from './share'
import { cleanup } from './utils/logger'
import { runPunchIn } from './utils/runner'
import pLimit from "p-limit"

const queryPunchIn = async (env: Env): Promise<{ success: boolean, punchIns: PunchInRow[] }> => {
	const stat = env.DB.prepare(`
		SELECT P.punch_in_id        AS punchInId
			,P.user_id           AS userId
			,P.punch_in_type     AS punchInType
			,P.punch_in_account  AS punchInAccount
			,P.punch_in_password AS punchInPassword
			,P.notify_email      AS notifyEmail
		FROM   TB_PUNCH_IN AS P
		WHERE  P.punch_in_enable = 'Y'
			AND P.punch_in_id NOT IN (SELECT L.punch_in_id
										FROM   TB_PUNCH_IN_LOG AS L
										WHERE  L.punch_in_status = 'Success'
												AND L.punch_in_id = P.punch_in_id
												AND SUBSTR(L.punch_in_datetime, 0, 11) = DATE('now', 'localtime')); `)

	const { success, results } = await stat.all<PunchInRow>()

	if (!success) {
		return { success: false, punchIns: [] }
	}

	return { success: true, punchIns: results as PunchInRow[] }
}

export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx): Promise<void> => {
	await cleanup(env)

	const { success, punchIns } = await queryPunchIn(env)

	if (!success) {
		console.error('Query punch-in failed ')
		return
	}

	const limit = pLimit(10)
	const tasks = punchIns.map(async (punchIn) => await limit(async () => { await runPunchIn(env, punchIn) }))

	await Promise.all(tasks)
}
