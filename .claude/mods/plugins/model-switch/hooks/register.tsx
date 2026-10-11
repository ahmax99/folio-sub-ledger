import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Effort } from '../types'

const model = atom({ plugin: 'model-switch', key: 'model' } as const, '')
const effort = atom({ plugin: 'model-switch', key: 'effort' } as const, '')
const isHidden = atom({ plugin: 'model-switch', key: 'isHidden' } as const, false)

const ACCENT = '#8f8cf4'

// What each button runs as `/model <id>`, and the word that finds it in a model id.
const MODELS = [
  { label: 'Fable', id: 'claude-fable-5-1', match: 'fable' },
  { label: 'Opus', id: 'claude-opus-5-5', match: 'opus' },
  { label: 'Sonnet', id: 'claude-sonnet-5-5', match: 'sonnet' },
  { label: 'Haiku', id: 'claude-haiku-5-5', match: 'haiku' },
] as const

const EFFORTS: readonly { label: string; level: Effort }[] = [
  { label: 'low', level: 'low' },
  { label: 'med', level: 'medium' },
  { label: 'high', level: 'high' },
  { label: 'xhigh', level: 'xhigh' },
  { label: 'max', level: 'max' },
]

async function sync($: EngineInterface): Promise<void> {
  const current = await $.session.model().catch(() => '')
  if (current) await update($, model, () => current)
}

async function run($: EngineInterface, command: 'model' | 'effort', args: string): Promise<void> {
  const known = (await $.command.list()).some(c => c.name === command)
  if (!known) {
    $.ui.toast(`model-switch: this build has no /${command} command`)
    return
  }
  try {
    await $.command.run({ command, args })
  } catch (err) {
    $.ui.toast(`/${command} ${args}: ${err instanceof Error ? err.message : String(err)}`)
    return
  }
  if (command === 'effort') await update($, effort, () => args)
  await sync($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({ name: 'switchbar', description: 'Show or hide the model and effort buttons above the prompt' })
    await sync($)
    return started
  })

  on('command.run', { command: 'switchbar' }, async $ => {
    const hidden = await update($, isHidden, h => !h)
    return { text: hidden ? 'Model and effort buttons hidden.' : 'Model and effort buttons shown.' }
  })

  // The engine says which effort each request used; keep the last one for the highlight.
  on('turn.step', async function* ($, e, next) {
    if (typeof e.effort === 'string') await update($, effort, () => e.effort as string)
    return yield* next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await sync($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) return next(e)

    const { Box, Text, Button } = $.ui.resolve(e)
    const current = (await read($, model)).toLowerCase()
    const level = await read($, effort)

    return (
      <Box flexDirection="row" gap={1}>
        <Text dimColor>model</Text>
        {MODELS.map(m =>
          current.includes(m.match) ? (
            <Text key={m.id} bold color={ACCENT}>
              ●{m.label}
            </Text>
          ) : (
            <Button key={m.id} label={m.label} plain onPress={() => run($, 'model', m.id)} />
          ),
        )}
        <Text dimColor>effort</Text>
        {EFFORTS.map(x =>
          level === x.level ? (
            <Text key={x.level} bold color={ACCENT}>
              ●{x.label}
            </Text>
          ) : (
            <Button key={x.level} label={x.label} plain onPress={() => run($, 'effort', x.level)} />
          ),
        )}
      </Box>
    )
  })
}
