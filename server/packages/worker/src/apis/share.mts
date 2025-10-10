import { type Env } from '../share.mjs'

export interface HonoEnv {
	Bindings: Env,
	Variables: {
		userId: number
	}
}
