import { Env } from '../../share'

export const decrypt = async (env: Env, cipherText: string) => {
	const privateKey = await env.KV.get('RSA_PRIVATE_KEY') as string

	const cipherBuffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0))
	const privateKeyBuffer = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0))

	const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        false,
        ['decrypt']
    )

	const plainBuffer = await crypto.subtle.decrypt(
		{
			name: 'RSA-OAEP'
		},
		cryptoKey,
		cipherBuffer
	)

	const decoder = new TextDecoder()
	const plainText = decoder.decode(plainBuffer)

	return plainText
}
