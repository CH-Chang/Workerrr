import { type HonoEnv } from './share.mjs'
import { OpenAPIHono } from '@hono/zod-openapi'

export const app = new OpenAPIHono<HonoEnv>()
