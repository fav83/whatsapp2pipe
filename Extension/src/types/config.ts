import type { Pipeline, Stage } from './deal'
import type { FeatureFlags } from './featureFlags'

export interface UserConfig {
  message: string | null
  pipelines: Pipeline[]
  stages: Stage[]
  featureFlags?: FeatureFlags
}
