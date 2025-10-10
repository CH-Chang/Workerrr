import { app } from './app.mjs'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from './middlewares/cors'

app.get(
	'/swagger',
	swaggerUI({
		url: '/doc'
	})
)

app.doc('/doc', {
	info: {
		title: 'Workerrr API',
		version: 'v1'
	},
	openapi: '3.1.0',
	security: [
		{
			Bearer: []
		}
	]
})

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
	type: 'http',
	scheme: 'bearer',
	bearerFormat: 'JWT'
})

app.use('/api/v1/*', cors)

import './apis/v1/member/post/ssoLogin.mjs'
import './apis/v1/member/get/user.mjs'
import './apis/v1/punchIn/get/log.mjs'
import './apis/v1/punchIn/get/root.mjs'
import './apis/v1/punchIn/put/cancel.mjs'
import './apis/v1/punchIn/put/password.mjs'
import './apis/v1/punchIn/post/otp.mjs'

export const fetch = app.fetch
