import { Hono } from 'hono'
import { hmacAuth } from './middlewares/hmac-auth-middleware'

const app = new Hono()

app.use(hmacAuth())

app.put('/', (c) => c.text('Hono!'))

export const fetch = app.fetch
