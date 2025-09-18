import { app } from './app'
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

import './apis/v1/member/post/ssoLogin'
import './apis/v1/member/get/user'
import './apis/v1/punchIn/get/log'
import './apis/v1/punchIn/get/root'
import './apis/v1/punchIn/put/cancel'
import './apis/v1/punchIn/put/password'
import './apis/v1/punchIn/post/otp'

export const fetch = app.fetch
