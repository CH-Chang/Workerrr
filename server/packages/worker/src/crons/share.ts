import { type Env } from '../share'

export interface CronRow {
	cronId: number
	cronKey: string
	cronTask: string
	cronArguments: string
}

export type CronTask<T> = (env: Env, cronArgs: T) => Promise<void>
