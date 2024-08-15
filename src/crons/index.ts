import { type Env } from '../share'
import { type CronRow, CronTask } from './share'
import { cleanup } from './utils/logger'
import { punch } from './crons/punch'
import { schedule } from './crons/schedule'

const cronTaskMap: Record<string, CronTask | undefined> = {
	punch,
	schedule
}

const queryCrons = async (env: Env): Promise<{ success: boolean, rows: CronRow[] }> => {
	const stat = env.DB.prepare(``)

	const { success, results } = await stat.all<CronRow>()

	if (!success) {
		return { success: false, rows: [] }
	}

	return { success: true, rows: results as CronRow[] }
}


export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx): Promise<void> => {
	await cleanup(env)

	const { cron } = event

	const { success, rows } = await queryCrons(env)
	if (!success) return

	const row = rows.find((row) => row.cronKey === cron)
	if (typeof row === 'undefined') return

	const cronTask = row.cronTask
	const task = cronTaskMap[cronTask]
	if (typeof task === 'undefined') return

	await task(env)
}
