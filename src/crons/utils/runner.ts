import { type PunchInRow, type PunchInTask } from "../share";
import { mail } from './mailer'
import systexTask from '../tasks/systex'

const taskMap: Record<string, PunchInTask> = {
	systex: systexTask
}

export const runPunchIn = async (punchIn: PunchInRow): Promise<void> => {
	const { punchInType, punchInAccount, punchInPassword, notifyEmail } = punchIn

	const task = taskMap[punchInType]
	const success = typeof task === 'undefined'
		? false
		: await task(punchInAccount, punchInPassword)

	await mail(notifyEmail, success, punchInAccount, punchInType)
}
