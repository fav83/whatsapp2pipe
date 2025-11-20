import { useState, useEffect, useMemo } from 'react'
import { X, Loader2 } from 'lucide-react'
import { usePipedrive } from '../hooks/usePipedrive'
import { useToast } from '../context/ToastContext'
import type { Deal, Pipeline, Stage } from '../../types/deal'
import { StyledDropdown } from './StyledDropdown'

interface CreateDealFormProps {
  personId: number
  personName: string
  pipelines?: Pipeline[]
  stages?: Stage[]
  onDealCreated: (deal: Deal) => void
  onCancel: () => void
}

export function CreateDealForm({
  personId,
  personName,
  pipelines,
  stages,
  onDealCreated,
  onCancel,
}: CreateDealFormProps) {
  const { createDeal, isCreatingDeal, createDealError } = usePipedrive()
  const { showToast } = useToast()

  // Find default pipeline (orderNr = 0) or use first pipeline
  const defaultPipeline = useMemo(
    () =>
      pipelines && pipelines.length > 0
        ? pipelines.find((p) => p.orderNr === 0) || pipelines[0]
        : undefined,
    [pipelines]
  )

  // Get stages for default pipeline
  const defaultStages = useMemo(() => {
    if (!defaultPipeline || !stages || stages.length === 0) return []
    return stages
      .filter((s) => s.pipelineId === defaultPipeline.id)
      .sort((a, b) => a.orderNr - b.orderNr)
  }, [defaultPipeline, stages])

  const firstStage = defaultStages && defaultStages.length > 0 ? defaultStages[0] : undefined

  // Form state
  const [title, setTitle] = useState(`${personName} Deal`)
  const [value, setValue] = useState('')
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    defaultPipeline?.id || null
  )
  const [selectedStageId, setSelectedStageId] = useState<number | null>(firstStage?.id || null)
  const [error, setError] = useState<string | null>(null)

  // Get current stages for selected pipeline
  const currentStages = useMemo(() => {
    if (!selectedPipelineId) return []
    return stages
      .filter((s) => s.pipelineId === selectedPipelineId)
      .sort((a, b) => a.orderNr - b.orderNr)
  }, [selectedPipelineId, stages])

  const pipelineOptions = useMemo(
    () => (pipelines || []).map((pipeline) => ({ id: pipeline.id, label: pipeline.name })),
    [pipelines]
  )

  const stageOptions = useMemo(
    () => currentStages.map((stage) => ({ id: stage.id, label: stage.name })),
    [currentStages]
  )

  // Update error state when createDealError changes
  useEffect(() => {
    if (createDealError) {
      setError(createDealError.message)
    }
  }, [createDealError])

  // Validation
  const isValidTitle = (t: string): boolean => {
    return t.trim().length > 0
  }

  const isSubmitDisabled =
    !isValidTitle(title) ||
    selectedPipelineId === null ||
    selectedStageId === null ||
    isCreatingDeal

  // Handle pipeline change
  const handlePipelineSelect = (pipelineId: number) => {
    setSelectedPipelineId(pipelineId)

    // Update stages dropdown
    const newStages = (stages || [])
      .filter((s) => s.pipelineId === pipelineId)
      .sort((a, b) => a.orderNr - b.orderNr)

    // Auto-select first stage of new pipeline
    if (newStages.length > 0) {
      setSelectedStageId(newStages[0].id)
    } else {
      setSelectedStageId(null)
    }
  }

  // Handle create
  const handleCreate = async () => {
    if (isSubmitDisabled) return

    // Clear previous error
    setError(null)

    try {
      // Prepare data
      const dealData = {
        title: title.trim(),
        personId,
        pipelineId: selectedPipelineId!,
        stageId: selectedStageId!,
        ...(value &&
          value.trim() !== '' && {
            value: parseFloat(value),
          }),
      }

      // Validate value if provided
      if (dealData.value !== undefined && (isNaN(dealData.value) || dealData.value <= 0)) {
        setError('Please enter a valid positive number for value')
        return
      }

      // Call API
      const deal = await createDeal(dealData)

      if (deal) {
        // Success: notify parent
        showToast('Deal created successfully')
        onDealCreated(deal)
        // Note: Component will unmount as parent handles state transition
      } else {
        // API returned null (error handled by hook)
        const errorMessage = createDealError?.message || 'Failed to create deal. Please try again.'
        setError(errorMessage)
      }
    } catch (err) {
      // Unexpected error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(errorMessage)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    onCancel()
  }

  // Check if pipelines and stages are loaded
  if (!pipelines || pipelines.length === 0 || !stages || stages.length === 0) {
    return (
      <div className="p-3 space-y-3">
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <div className="flex-1 text-sm text-yellow-800">
            Loading configuration... Please wait a moment and try again.
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-solid border-border-secondary text-text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <div className="flex-1 text-sm text-red-800">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreatingDeal}
          placeholder="Deal title"
          className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Value Field */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Value</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isCreatingDeal}
          placeholder="0"
          className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Pipeline Dropdown */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Pipeline *</label>
        <StyledDropdown
          options={pipelineOptions}
          value={selectedPipelineId}
          onChange={handlePipelineSelect}
          placeholder="Select a pipeline..."
          disabled={isCreatingDeal}
        />
      </div>

      {/* Stage Dropdown */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Stage *</label>
        <StyledDropdown
          options={stageOptions}
          value={selectedStageId}
          onChange={(stageId) => setSelectedStageId(stageId)}
          placeholder={stageOptions.length === 0 ? 'No stages available' : 'Select a stage...'}
          disabled={isCreatingDeal || stageOptions.length === 0}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleCancel}
          disabled={isCreatingDeal}
          className="flex-1 px-4 py-2 bg-white border text-brand-primary text-sm font-medium rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ border: '1px solid #665F98', borderColor: '#665F98' }}
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={isSubmitDisabled}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isSubmitDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-primary text-white hover:bg-brand-hover cursor-pointer'
          }`}
        >
          {isCreatingDeal ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </span>
          ) : (
            'Create'
          )}
        </button>
      </div>
    </div>
  )
}
