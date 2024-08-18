import { type Env } from './share'
import { scheduled } from './crons'
import { fetch } from './apis'

export default {
	scheduled,
	fetch
} satisfies ExportedHandler<Env>;
