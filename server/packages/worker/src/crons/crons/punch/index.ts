import { type Env } from '../../../share'
import { type CronTask } from '../../share'
import { type PunchInRow } from './share'
import { runPunchIn } from './utils/runner'
import pLimit from "p-limit"

interface PunchCronTaskArguments {
	punchInBatch: number
}

const queryPunchIn = async (env: Env, punchInBatch: number): Promise<{ success: boolean, punchIns: PunchInRow[] }> => {
	const stat = env.DB
		.prepare(`
			SELECT P.punch_in_id       AS punchInId,
				P.user_id           AS userId,
				P.punch_in_type     AS punchInType,
				P.punch_in_account  AS punchInAccount,
				P.punch_in_password AS punchInPassword,
				P.notify_email      AS notifyEmail
			FROM   TB_PUNCH_IN AS P
			WHERE  P.punch_in_enable = 'Y'
				AND P.punch_in_batch = ?1
				AND P.punch_in_id NOT IN (SELECT L.punch_in_id
											FROM   TB_PUNCH_IN_LOG AS L
											WHERE  L.punch_in_status = 'Success'
													AND L.punch_in_id = P.punch_in_id
													AND Substr(L.punch_in_datetime, 0, 11) =
														Date('now', 'localtime'))
				AND P.punch_in_id NOT IN (SELECT M.punch_in_id
											FROM   TB_PUNCH_IN_MANUAL M
											WHERE  M.punch_in_manual_type = 'Cancel'
													AND M.punch_in_manual_date =
														Date('now', 'localtime')
													AND M.punch_in_id = P.punch_in_id);  `)
		.bind(
			punchInBatch
		)

	const { success, results } = await stat.all<PunchInRow>()

	if (!success) {
		return { success: false, punchIns: [] }
	}

	return { success: true, punchIns: results as PunchInRow[] }
}

export const punch: CronTask<PunchCronTaskArguments> = async (env: Env, cronArgs): Promise<void> => {
	const { punchInBatch } = cronArgs
	const { success, punchIns } = await queryPunchIn(env, punchInBatch)

	if (!success) {
		console.error('Query punch-in failed ')
		return
	}

	const limit = pLimit(10)
	const tasks = punchIns.map(async (punchIn) => await limit(async () => { await runPunchIn(env, punchIn) }))

	await Promise.all(tasks)
}
