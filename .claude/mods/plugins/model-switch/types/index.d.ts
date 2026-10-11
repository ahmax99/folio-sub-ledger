export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

declare module 'claude-code' {
  interface PluginState {
    'model-switch': {
      model: string
      effort: string
      isHidden: boolean
    }
  }
}
