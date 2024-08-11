import { type PunchInRow, type PunchInTask } from '../share'
import { type Env } from '../../share'
import { mail } from './mailer'
import { log } from './logger'
import { decrypt } from './cipher'
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

	await mail(env, punchInStatus, notifyEmail, punchInAccount, punchInType)
	await log(env, punchInStatus, punchInId, punchInMemo)
}
