import { type Env } from '../../share'
import { Resend } from 'resend'
import { render as renderPunchIn } from '../template/punchIn'
import { render as renderSchedule } from '../template/schedule'
import { logEmail } from '../../share/utils/logger'
import AsyncLock from 'async-lock'

const locker = new AsyncLock()

const send = async (env: Env, email: string, subject: string, content: string): Promise<void> => {
	const api = await env.KV.get('RESEND_API_KEY') as string
	const resend = new Resend(api)

	await locker.acquire(
		'Email',
		async () => {
			const { error } = await resend.emails.send({
				from: 'Workerrr <workerrr@0000886.xyz>',
				to: email,
				subject: subject,
				html: content,
			})

			const emailStatus = error === null
			const emailMessage = error?.message ?? ''

			await logEmail(env, emailStatus, emailMessage, email, subject, content)
			await new Promise((resolve) => setTimeout(resolve, 1000))
		},
		{
			timeout: 0
		}
	)
}

export const mailSchedule = async (env: Env, email: string, account: string, type: string, url: string): Promise<void> => {
	const subject = '打工人系統通知'
	const content = renderSchedule({
		url,
		account,
		type: type.toUpperCase()
	})

	await send(env, email, subject, content)
}

export const mailPunchIn = async (env: Env, status: boolean, reason: string, email: string, account: string, type: string): Promise<void> => {
	const subject = '打工人系統通知'
	const content = renderPunchIn({
		status,
		reason,
		account,
		type: type.toUpperCase()
	})

	await send(env, email, subject, content)
}
