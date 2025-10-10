import { type Env } from './share.mjs'
import { scheduled } from './crons/index.mjs'
import { fetch } from './apis/index.mjs'

export default {
	scheduled,
	fetch
} satisfies ExportedHandler<Env>;
