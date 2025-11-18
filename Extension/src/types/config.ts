import type { Pipeline, Stage } from './deal'

export interface UserConfig {
  message: string | null
  pipelines: Pipeline[]
  stages: Stage[]
}
