import { type HonoEnv } from './share'
import { OpenAPIHono } from '@hono/zod-openapi'

export const app = new OpenAPIHono<HonoEnv>()
