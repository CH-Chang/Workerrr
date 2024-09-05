import { type PunchInRow, type PunchInTask } from '../share'
import { type Env } from '../../../../share'
import { mailPunchIn } from '../../../../share/utils/mailer'
import { logPunchIn } from '../../../utils/logger'
import { decrypt } from '../../../../share/utils/aes'
import systexTask from '../tasks/systex'


const taskMap: Record<string, PunchInTask> = {
	systex: systexTask
}

export const runPunchIn = async (env: Env, punchIn: PunchInRow): Promise<void> => {
	const { punchInId, punchInType, punchInAccount, punchInPassword, notifyEmail } = punchIn

	const decryptedPunchInPassword = await decrypt(env, punchInPassword)

	const task = taskMap[punchInType]

	const { punchInStatus, punchInMemo } = typeof task === 'undefined'
		? { punchInStatus: false, punchInMemo: '未知打卡類型' }
		: await task(punchInAccount, decryptedPunchInPassword)

	await logPunchIn(env, punchInStatus, punchInId, punchInMemo)
	await mailPunchIn(env, punchInStatus, punchInMemo, notifyEmail, punchInAccount, punchInType)
}
