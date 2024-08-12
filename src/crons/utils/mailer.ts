import { type Env } from '../../share'
import { Resend } from 'resend'
import { render } from '../template/punchIn'
import { logEmail } from './logger'

export const mailPunchIn = async (env: Env, status: boolean, reason: string, email: string, account: string, type: string): Promise<void> => {
	const api = await env.KV.get('RESEND_API_KEY') as string

	const resend = new Resend(api);

	const subject = '打工人系統通知'
	const content = render({
		status,
		reason,
		account,
		type: type.toUpperCase()
	})

	const { error } = await resend.emails.send({
		from: 'Workerrr <workerrr@0000886.xyz>',
		to: email,
		subject: subject,
		html: content,
	})

	await logEmail(env, error === null, email, subject, content)
}
