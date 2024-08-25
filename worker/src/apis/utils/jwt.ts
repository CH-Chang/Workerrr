import jwt from '@tsndr/cloudflare-worker-jwt'
import { Env } from '../../share'

export const sign = async (env: Env, userId: number): Promise<string> => {
	const secret = await env.KV.get('JWT_SECRET') as string

	const jwtToken = await jwt.sign({
		userId,
		nbf: Math.floor(Date.now() / 1000) - (60 * 60),
		exp: Math.floor(Date.now() / 1000) + (2 * (60 * 60))
	}, secret)

	return jwtToken
}

export const verify = async (env: Env, jwtToken: string): Promise<number | null> => {
	const secret = await env.KV.get('JWT_SECRET') as string

	const verified = await jwt.verify(jwtToken, secret)
	if (!verified) return null

	const data = await jwt.decode<{ userId: number }>(jwtToken)
	const userId = data.payload?.userId
	if (typeof userId === 'undefined') return null

	return userId
}
