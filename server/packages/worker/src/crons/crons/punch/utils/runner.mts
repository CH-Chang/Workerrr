import { type PunchInRow } from '../share.mjs'
import { type Env } from '../../../../share.mjs'
import { mailPunchIn } from '../../../../share/utils/mailer.mjs'
import { logPunchIn } from '../../../utils/logger.mjs'
import { decrypt } from '../../../../share/utils/aes.mjs'
import { systemPunchTask, type PunchInTask } from '@workerrr/core'

const taskMap: Record<string, PunchInTask> = {
	systex: systemPunchTask
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
