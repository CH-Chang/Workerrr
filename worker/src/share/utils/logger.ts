import dayjs from 'dayjs'

export const logEmail = async (env: Env, status: boolean, message: string, to: string, subject: string, content: string): Promise<void> => {
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
