import dayjs from 'dayjs'
import { type Env } from '../../../share'
import { type CronTask } from '../../share'
import { nanoid } from 'nanoid'
import { mailSchedule } from '../../utils/mailer'
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

	const key = nanoid()

	const contentObject = { punchInId }
	const content = JSON.stringify(contentObject)

	const expiration = dayjs().add(5, 'hours').format('YYYY-MM-DD HH:mm:ss')

	await env.DB
		.prepare(`
			INSERT INTO TB_CACHE
						(cache_key,
						cache_content,
						cache_expiration_datetime)
			VALUES      (?1,
						?2,
						?3)`)
		.bind(
			key,
			content,
			expiration
		)
		.run()

	const baseUrl = await env.KV.get("SCHEDULE_BASE_URL") as string
	const url = `${baseUrl}?${qs.stringify({ key })}`

	await mailSchedule(env, notifyEmail, punchInAccount, punchInType, url)
}


export const schedule: CronTask = async (env: Env): Promise<void> => {
	const { success, punchIns } = await query(env)
	if (!success) return

	const limit = pLimit(10)
	const tasks = punchIns.map(async punchIn => await limit(async () => { await process(env, punchIn) }))
	await Promise.all(tasks)
}
