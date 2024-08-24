import { type Env } from '../share'

export interface HonoEnv {
	Bindings: Env,
	Variables: {
		userId: number
	}
}
