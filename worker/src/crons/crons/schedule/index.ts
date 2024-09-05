import dayjs from 'dayjs'
import { type Env } from '../../../share'
import { type CronTask } from '../../share'
import { nanoid } from 'nanoid'
import { mailSchedule } from '../../../share/utils/mailer'
import pLimit from 'p-limit'
import qs from 'qs'

interface PunchInRow {
	punchInId: number
	punchInType: string
	punchInAccount: string
	notifyEmail: string
}

const query = async (env: Env): Promise<{ success: boolean, punchIns: PunchInRow[] }> => {
	const stat = env.DB.prepare(`
		SELECT P.punch_in_id        AS punchInId
		    ,P.punch_in_account  AS punchInAccount
			,P.punch_in_type     AS punchInType
			,P.notify_email      AS notifyEmail
		FROM   TB_PUNCH_IN AS P
		WHERE  P.punch_in_enable = 'Y' `)

	const { success, results } = await stat.all<PunchInRow>()

	if (!success) {
		return { success: false, punchIns: [] }
	}

	return { success: true, punchIns: results as PunchInRow[] }
}

const process = async (env: Env, punchIn: PunchInRow): Promise<void> => {
	const { punchInId, punchInAccount, punchInType, notifyEmail } = punchIn

	const token = nanoid()

	const expiration = dayjs().add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')

	await env.DB
		.prepare(`
			INSERT INTO TB_SCHEDULE
						(schedule_token,
						punch_in_id,
						schedule_expiration_datetime)
			VALUES      (?1,
						?2,
						?3)`)
		.bind(
			token,
			punchInId,
			expiration
		)
		.run()

	const baseUrl = await env.KV.get("SCHEDULE_BASE_URL") as string
	const url = `${baseUrl}?${qs.stringify({ token })}`

	await mailSchedule(env, notifyEmail, punchInAccount, punchInType, url)
}


export const schedule: CronTask<{}> = async (env: Env): Promise<void> => {
	const { success, punchIns } = await query(env)
	if (!success) return

	const limit = pLimit(10)
	const tasks = punchIns.map(async punchIn => await limit(async () => { await process(env, punchIn) }))
	await Promise.all(tasks)
}
