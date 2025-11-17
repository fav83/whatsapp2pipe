export interface Deal {
  id: number
  title: string
  value: string // Formatted: "$50,000.00"
  stage: DealStage
  pipeline: DealPipeline
  status: 'open' | 'won' | 'lost'
}

export interface DealStage {
  id: number
  name: string
  order: number
}

export interface DealPipeline {
  id: number
  name: string
}
