import { type Env } from '../share'
import { type PunchInRow } from './share'
import { runPunchIn } from './utils/runner'
import pLimit from "p-limit"

const queryPunchIn = async (env: Env): Promise<{ success: boolean, punchIns: PunchInRow[] }> => {
	const stat = env.DB.prepare(`
		SELECT
			punch_in_id       AS punchInId,
			user_id           AS userId,
			punch_in_type     AS punchInType,
			punch_in_account  AS punchInAccount,
			punch_in_password AS punchInPassword,
			notify_email      AS notifyEmail
		FROM   TB_PUNCH_IN;`)

	const { success, results } = await stat.all<PunchInRow>()

	if (!success) {
		return { success: false, punchIns: [] }
	}

	return { success: true, punchIns: results as PunchInRow[] }
}

export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx): Promise<void> => {
	const { success, punchIns } = await queryPunchIn(env)

	if (!success) {
		console.error('Query punch-in failed ')
		return
	}

	const limit = pLimit(10)
	const tasks = punchIns.map(async (punchIn) => await limit(async () => { await runPunchIn(env, punchIn) }))

	await Promise.all(tasks)
}
