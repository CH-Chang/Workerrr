import { RSA_PUBLIC_KEY } from '$env/static/public'

export const encrypt = async (plaintext: string) => {
	const publicKey = RSA_PUBLIC_KEY

	const plainBuffer = Uint8Array.from(atob(plaintext), c => c.charCodeAt(0))
	const publicKeyBuffer = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))

	const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        publicKeyBuffer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        false,
        ['encrypt']
    )

	const cipherBuffer = await crypto.subtle.encrypt(
		{
			name: 'RSA-OAEP'
		},
		cryptoKey,
		plainBuffer
	)

	const decoder = new TextDecoder()
	const cipherText = decoder.decode(cipherBuffer)

	return cipherText
}
