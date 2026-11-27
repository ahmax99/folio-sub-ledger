// Must stay the first import: Sentry instruments modules as they load.
import '@/instrument.js'
import { app } from '@/app.js'
import { env } from '@/config/env.js'
import { logger } from '@/config/logger.js'
import { loadSecrets } from '@/config/secrets.js'

await loadSecrets()

app.listen(env.BACKEND_PORT)

logger.info(`🚀 Server running on port ${env.BACKEND_PORT}`)

export default app
