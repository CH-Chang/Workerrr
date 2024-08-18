import { type Env } from '../share'
import { type CronRow, CronTask } from './share'
import { cleanup } from './utils/logger'
import { punch } from './crons/punch'
import { schedule } from './crons/schedule'

const cronTaskMap: Record<string, CronTask<any> | undefined> = {
	punch,
	schedule
}

const queryCrons = async (env: Env, cron: string): Promise<CronRow | null> => {
	const stat = env.DB
		.prepare(`
			SELECT cron_id        AS cronId,
				cron_key       AS cronKey,
				cron_task      AS cronTask,
				cron_arguments AS cronArguments
			FROM   TB_CRON
			WHERE  cron_key = ?1 `)
		.bind(cron)

	return await stat.first<CronRow>()
}


export const scheduled: ExportedHandlerScheduledHandler<Env> = async (event, env, ctx): Promise<void> => {
	await cleanup(env)

	const { cron } = event

	const row = await queryCrons(env, cron)
	if (row === null) return

	const cronTask = row.cronTask
	const cronArguments = row.cronArguments
	const parsedCronArguments = JSON.parse(cronArguments)

	const task = cronTaskMap[cronTask]
	if (typeof task === 'undefined') return

	await task(env, parsedCronArguments)
}
