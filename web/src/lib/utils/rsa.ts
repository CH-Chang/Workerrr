import { PUBLIC_RSA_PUBLIC_KEY } from '$env/static/public'

export const encrypt = async (plaintext: string) => {
	const publicKey = PUBLIC_RSA_PUBLIC_KEY

	const encoder = new TextEncoder()
    const plainBuffer = encoder.encode(plaintext)

	const publicKeyBuffer = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))

	const cryptoKey = await crypto.subtle.importKey(
        'spki',
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

	const cipherText = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)))

	return cipherText
}
