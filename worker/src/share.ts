export interface Env {
	DB: D1Database
	KV: KVNamespace
	CORS_ORIGIN: string
	JWT_SECRET: string
	RSA_PRIVATE_KEY: string
	ENABLE_AUTHORIZATION: string
	SENSITIVE_DATA_KEY: string
	SENSITIVE_DATA_IV: string
	RESEND_API_KEY: string
	SCHEDULE_BASE_URL: string
}
