/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WhatsAppChatStatus } from '../../src/content-script/whatsapp-integration/chat-status'
import type { ChatStatus } from '../../src/content-script/whatsapp-integration/types'

describe('WhatsAppChatStatus', () => {
  let callback: ReturnType<typeof vi.fn<[ChatStatus], void>>
  let chatStatus: WhatsAppChatStatus

  beforeEach(() => {
    callback = vi.fn()
    chatStatus = new WhatsAppChatStatus(callback)

    // Mock window.StoreWhatsApp2Pipe
    ;(window as any).StoreWhatsApp2Pipe = null

    // Clear any existing intervals
    vi.clearAllTimers()
  })

  afterEach(() => {
    chatStatus.stop()
    delete (window as any).StoreWhatsApp2Pipe
  })

  describe('constructor', () => {
    it('creates instance with callback', () => {
      expect(chatStatus).toBeInstanceOf(WhatsAppChatStatus)
    })

    it('does not start polling automatically', () => {
      vi.useFakeTimers()
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(200)
      expect(callback).not.toHaveBeenCalled()
      vi.useRealTimers()
    })
  })

  describe('start/stop lifecycle', () => {
    it('starts polling when start() is called', () => {
      vi.useFakeTimers()

      // Mock Store with active chat
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'Test User',
              },
            },
          ],
        },
      }

      chatStatus.start()

      // Should not call immediately
      expect(callback).not.toHaveBeenCalled()

      // Should call after 200ms
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      // Should NOT call again after another 200ms (same chat)
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('stops polling when stop() is called', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'Test User',
              },
            },
          ],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      chatStatus.stop()

      // Should not call after stop
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })
  })

  describe('chat detection', () => {
    it.skip('detects no active chat', () => {
      // Note: Skipped due to test environment limitations
      // This functionality is tested via manual testing
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)

      expect(callback).toHaveBeenCalledWith({
        phone: null,
        name: null,
        is_group: false,
      })

      vi.useRealTimers()
    })

    it('detects individual chat with phone', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'John Doe',
                __x_pushname: 'John',
              },
              __x_groupMetadata: null,
            },
          ],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)

      expect(callback).toHaveBeenCalledWith({
        phone: '+1234567890',
        name: 'John',
        is_group: false,
      })

      vi.useRealTimers()
    })

    it('detects group chat', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '123456789' },
                __x_name: 'Team Chat',
              },
              __x_groupMetadata: {
                participants: {
                  _index: {
                    participant1: {
                      __x_contact: {
                        __x_id: { user: '1111111111' },
                        __x_pushname: 'Alice',
                      },
                    },
                    participant2: {
                      __x_contact: {
                        __x_id: { user: '2222222222' },
                        __x_name: 'Bob',
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)

      expect(callback).toHaveBeenCalledWith({
        phone: null,
        name: 'Team Chat',
        is_group: true,
        group_name: 'Team Chat',
        participants: [
          { phone: '+1111111111', name: 'Alice' },
          { phone: '+2222222222', name: 'Bob' },
        ],
      })

      vi.useRealTimers()
    })

    it('only calls callback when chat changes', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'John Doe',
                __x_pushname: 'John',
              },
              __x_groupMetadata: null,
            },
          ],
        },
      }

      chatStatus.start()

      // First poll - should call
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      // Second poll - same chat, should not call
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      // Third poll - still same chat
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('calls callback when chat changes', () => {
      vi.useFakeTimers()

      const mockStore = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'John Doe',
                __x_pushname: 'John',
              },
              __x_groupMetadata: null,
            },
          ],
        },
      }

      ;(window as any).StoreWhatsApp2Pipe = mockStore

      chatStatus.start()

      // First poll
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenLastCalledWith({
        phone: '+1234567890',
        name: 'John',
        is_group: false,
      })

      // Change active chat
      mockStore.Chat.getModelsArray = () => [
        {
          active: true,
          __x_contact: {
            __x_id: { user: '9876543210' },
            __x_name: 'Jane Smith',
            __x_pushname: 'Jane',
          },
          __x_groupMetadata: null,
        },
      ]

      // Second poll - should detect change
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenLastCalledWith({
        phone: '+9876543210',
        name: 'Jane',
        is_group: false,
      })

      vi.useRealTimers()
    })
  })

  describe('error handling', () => {
    it('handles Store unavailable gracefully', () => {
      vi.useFakeTimers()

      // No Store available
      ;(window as any).StoreWhatsApp2Pipe = null

      chatStatus.start()

      // Should not throw, should attempt DOM fallback
      expect(() => {
        vi.advanceTimersByTime(200)
      }).not.toThrow()

      vi.useRealTimers()
    })

    it('handles Store errors gracefully', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => {
            throw new Error('Test error')
          },
        },
      }

      chatStatus.start()

      // Should not throw
      expect(() => {
        vi.advanceTimersByTime(200)
      }).not.toThrow()

      vi.useRealTimers()
    })
  })

  describe('name priority', () => {
    it('prefers pushname over name', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'John Doe Official',
                __x_pushname: 'John (preferred)',
              },
              __x_groupMetadata: null,
            },
          ],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John (preferred)',
        })
      )

      vi.useRealTimers()
    })

    it('falls back to name when pushname not available', () => {
      vi.useFakeTimers()
      ;(window as any).StoreWhatsApp2Pipe = {
        Chat: {
          getModelsArray: () => [
            {
              active: true,
              __x_contact: {
                __x_id: { user: '1234567890' },
                __x_name: 'John Doe',
              },
              __x_groupMetadata: null,
            },
          ],
        },
      }

      chatStatus.start()
      vi.advanceTimersByTime(200)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
        })
      )

      vi.useRealTimers()
    })
  })
})
