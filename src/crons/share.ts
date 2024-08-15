import { type Env } from '../share'

export interface CronRow {
	cronId: number
	cronKey: string
	cronTask: string
}

export type CronTask = (env: Env) => Promise<void>
