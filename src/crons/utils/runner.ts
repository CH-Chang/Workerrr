import { type PunchInRow, type PunchInTask } from '../share'
import { type Env } from '../../share'
import { mailPunchIn } from './mailer'
import { logPunchIn } from './logger'
import { decrypt } from './cipher'
import systexTask from '../tasks/systex'


const taskMap: Record<string, PunchInTask> = {
	systex: systexTask
}

const wrapRetry = async (retryCount: number, env: Env, task: PunchInTask, punchInId: number, punchInAccount: string, punchInPassword: string): Promise<{ punchInStatus: boolean, punchInMemo: string }> => {
	while (true) {
		const { punchInStatus, punchInMemo } = await task(punchInAccount, punchInPassword)
		await logPunchIn(env, punchInStatus, punchInId, punchInMemo)

		if (!punchInStatus) {
			if (retryCount > 0) {
				retryCount -= 1
				continue
			}

			return { punchInStatus, punchInMemo }
		}

		return { punchInStatus, punchInMemo }
	}
}

export const runPunchIn = async (env: Env, punchIn: PunchInRow): Promise<void> => {
	const { punchInId, punchInType, punchInAccount, punchInPassword, notifyEmail } = punchIn

	const decryptedPunchInPassword = await decrypt(env, punchInPassword)

	const task = taskMap[punchInType]

	const { punchInStatus, punchInMemo } = typeof task === 'undefined'
		? { punchInStatus: false, punchInMemo: '未知打卡類型' }
		: await wrapRetry(3, env, task, punchInId, punchInAccount, decryptedPunchInPassword)


	await mailPunchIn(env, punchInStatus, punchInMemo, notifyEmail, punchInAccount, punchInType)
}
