import { z } from 'zod'

export const DatabaseModel = {
  runtimeSecret: z.object({
    host: z.string().min(1),
    database: z.string().min(1),
    active: z.enum(['folio_runtime_a', 'folio_runtime_b']),
    passwords: z.object({
      folio_runtime_a: z.string().min(1),
      folio_runtime_b: z.string().min(1)
    })
  })
}

export type RuntimeDatabaseSecret = z.infer<typeof DatabaseModel.runtimeSecret>
