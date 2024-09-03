export const encrypt = async (env: Env, plainText: string): Promise<string> => {
	const encoder = new TextEncoder()

	const key = await env.KV.get('SENSITIVE_DATA_KEY') as string
	const iv = await env.KV.get('SENSITIVE_DATA_IV') as string

	const keyBuffer = encoder.encode(key)
	const ivBuffer = encoder.encode(iv)

	const keyCrypto = await crypto.subtle.importKey(
		'raw',
		keyBuffer,
		{ name: 'AES-CBC' },
		false,
		['encrypt']
	)

	const plainBuffer = encoder.encode(plainText)

	const cipherBuffer = await crypto.subtle.encrypt(
		{ name: 'AES-CBC', iv: ivBuffer },
		keyCrypto,
		plainBuffer
	)

	const cipherText = Array.from(new Uint8Array(cipherBuffer))
		.map(byte => String.fromCharCode(byte))
		.join('')

	return btoa(cipherText)
}

export const decrypt = async (env: Env, cipherText: string): Promise<string> => {
	const decoder = new TextDecoder()
	const encoder = new TextEncoder()

	const key = await env.KV.get('SENSITIVE_DATA_KEY') as string
	const iv = await env.KV.get('SENSITIVE_DATA_IV') as string

	const keyBuffer = encoder.encode(key)
	const ivBuffer = encoder.encode(iv)

	const keyCrypto = await crypto.subtle.importKey(
		'raw',
		keyBuffer,
		{ name: 'AES-CBC' },
		false,
		['decrypt']
	)

	const cipherBuffer = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0))

	const plainBuffer = await crypto.subtle.decrypt(
		{ name: 'AES-CBC', iv: ivBuffer },
		keyCrypto,
		cipherBuffer
	)

	const plaintext = decoder.decode(plainBuffer)

	return plaintext
}
