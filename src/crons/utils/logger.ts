import { type Env } from '../../share'
import dayjs from 'dayjs'

export const logPunchIn = async (env: Env, status: boolean, id: number, memo: string): Promise<void> => {
	await env.DB
		.prepare("DELETE FROM TB_PUNCH_IN_LOG WHERE punch_in_datetime < DATETIME('now', '-7 day', 'localtime')")
		.run()

	await env.DB
		.prepare('INSERT INTO TB_PUNCH_IN_LOG (punch_in_id, punch_in_datetime, punch_in_status, punch_in_memo) VALUES (?1, ?2, ?3, ?4)')
		.bind(
			id,
			dayjs().format('YYYY-MM-DD HH:mm:ss'),
			status ? 'Success' : 'Failed',
			memo
		)
		.run()
}

export const logEmail = async (env: Env, status: boolean, message: string, to: string, subject: string, content: string): Promise<void> => {
	await env.DB
		.prepare("DELETE FROM TB_EMAIL_LOG WHERE datetime < DATETIME('now', '-7 day', 'localtime')")
		.run()

	await env.DB
		.prepare('INSERT INTO TB_EMAIL_LOG ([to], subject, content, success, [message], datetime) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
		.bind(
			to,
			subject,
			content,
			status ? 'Success' : 'Failed',
			message,
			dayjs().format('YYYY-MM-DD HH:mm:ss')
		)
		.run()
}
