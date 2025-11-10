import React, { useState, useRef, useEffect } from 'react'
import { Spinner } from './Spinner'
import type { FeedbackResponse } from '../../types/messages'
import logger from '../../utils/logger'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalState = 'default' | 'submitting' | 'success' | 'error'

const MAX_CHARS = 5000

/**
 * Feedback modal component
 * Allows authenticated users to submit feedback with validation and error handling
 */
export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('')
  const [state, setState] = useState<ModalState>('default')
  const [errorMessage, setErrorMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && state === 'default' && textareaRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, state])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, message])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      // Add listener with slight delay to avoid immediate trigger
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, message])

  const handleClose = () => {
    // If user has typed text, confirm before closing
    if (message.trim().length > 0 && state === 'default') {
      const confirmed = window.confirm('Discard your feedback?')
      if (!confirmed) return
    }

    // Reset state and close
    resetModal()
    onClose()
  }

  const resetModal = () => {
    setMessage('')
    setState('default')
    setErrorMessage('')
  }

  const handleSubmit = async () => {
    if (message.trim().length === 0) return

    setState('submitting')
    setErrorMessage('')

    try {
      // Send message to service worker
      const response = await new Promise<FeedbackResponse>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'FEEDBACK_SUBMIT',
            message: message.trim(),
          },
          (response: FeedbackResponse) => {
            resolve(response)
          }
        )
      })

      if (response.type === 'FEEDBACK_SUBMIT_SUCCESS') {
        setState('success')
      } else {
        // Error response
        setState('error')
        setErrorMessage(response.error || 'Failed to submit feedback. Please try again.')
      }
    } catch (error) {
      logger.error('Failed to submit feedback:', error)
      setState('error')
      setErrorMessage('Failed to submit feedback. Please try again.')
    }
  }

  const handleSuccessClose = () => {
    resetModal()
    onClose()
  }

  const dismissError = () => {
    setErrorMessage('')
    setState('default')
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-[544px] bg-white rounded-lg shadow-lg border border-solid border-border-primary"
        style={{ maxHeight: '80vh' }}
      >
        {state === 'success' ? (
          // SUCCESS STATE
          <div className="p-5">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-[17px] font-semibold text-primary text-center mb-3">Thank you!</h2>
            <p className="text-sm text-secondary text-center mb-6">
              Your feedback has been received. We appreciate you taking the time to help us improve
              Chat2Deal.
            </p>

            {/* Close Button */}
            <button
              onClick={handleSuccessClose}
              className="w-full h-[38px] bg-brand-primary hover:bg-brand-hover
                text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // DEFAULT / SUBMITTING / ERROR STATE
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-solid border-border-secondary">
              <h2 id="feedback-modal-title" className="text-[17px] font-semibold text-primary">
                Send Feedback
              </h2>
              <button
                onClick={handleClose}
                disabled={state === 'submitting'}
                className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Close feedback modal"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Error Banner */}
              {state === 'error' && errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-solid border-red-200 rounded-lg flex items-start justify-between">
                  <p className="text-sm text-red-600 flex-1">{errorMessage}</p>
                  <button
                    onClick={dismissError}
                    className="ml-2 text-red-600 hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Instructional Text */}
              <p className="text-sm text-secondary mb-3">
                Share your thoughts with us! Whether it's a bug you've encountered, a feature you'd
                like to see, or general feedback about Chat2Deal - we'd love to hear from you.
              </p>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value)
                  }
                }}
                placeholder="Tell us what's on your mind..."
                disabled={state === 'submitting'}
                className="w-full min-h-[120px] max-h-[240px] p-3 border border-solid border-border-primary
                  rounded-lg text-sm text-primary placeholder-secondary resize-y
                  focus:outline-none focus:ring-1 focus:ring-brand-primary
                  disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Feedback message"
                aria-required="true"
              />

              {/* Character Counter */}
              <p className="mt-2 text-xs text-secondary text-right">
                {message.length} / {MAX_CHARS}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-solid border-border-secondary">
              <button
                onClick={handleClose}
                disabled={state === 'submitting'}
                className="h-[38px] px-4 border border-solid border-border-primary rounded-lg
                  text-secondary text-sm font-medium
                  hover:bg-bg-secondary transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={message.trim().length === 0 || state === 'submitting'}
                className="h-[38px] px-6 bg-brand-primary hover:bg-brand-hover rounded-lg
                  text-white text-sm font-medium transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center min-w-[80px]"
              >
                {state === 'submitting' ? <Spinner size="sm" color="white" /> : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
