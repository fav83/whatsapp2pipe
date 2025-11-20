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

export interface CreateDealData {
  title: string
  personId: number
  pipelineId: number
  stageId: number
  value?: number
}

export interface UpdateDealData {
  pipelineId: number
  stageId: number
}

export interface Pipeline {
  id: number
  name: string
  orderNr: number
  active: boolean
}

export interface Stage {
  id: number
  name: string
  orderNr: number
  pipelineId: number
}
