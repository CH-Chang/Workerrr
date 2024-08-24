import { app } from './app'
import { swaggerUI } from '@hono/swagger-ui'

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

import './apis/v1/member/post/ssoLogin'
import './apis/v1/punchIn/get/log'
import './apis/v1/punchIn/get/root'

export const fetch = app.fetch
