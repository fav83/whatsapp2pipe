import { describe, it, expect } from 'vitest'
import { sanitizeEvent } from '../../src/utils/sentryFilters'
import type { Event } from '@sentry/browser'

describe('sentryFilters', () => {
  describe('Phone number redaction', () => {
    it('redacts international phone numbers with + prefix', () => {
      const event: Event = { message: 'Error for +48123456789' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Error for [PHONE_REDACTED]')
    })

    it('redacts phone numbers without + prefix', () => {
      const event: Event = { message: 'Contact 48123456789 failed' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Contact [PHONE_REDACTED] failed')
    })

    it('redacts phone numbers with parentheses and dashes', () => {
      const event: Event = { message: 'Call (123) 456-7890 now' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Call [PHONE_REDACTED] now')
    })

    it('redacts phone numbers with spaces', () => {
      const event: Event = { message: 'Phone: 123 456 7890' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Phone: [PHONE_REDACTED]')
    })

    it('redacts multiple phone numbers', () => {
      const event: Event = { message: 'Numbers: +48123456789 and +1234567890' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Numbers: [PHONE_REDACTED] and [PHONE_REDACTED]')
    })
  })

  describe('Email redaction', () => {
    it('redacts standard email addresses', () => {
      const event: Event = { message: 'User test@example.com logged in' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('User [EMAIL_REDACTED] logged in')
    })

    it('redacts email addresses with special characters', () => {
      const event: Event = { message: 'Email: user.name+tag@example.co.uk' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Email: [EMAIL_REDACTED]')
    })

    it('redacts multiple email addresses', () => {
      const event: Event = { message: 'From test@example.com to user@domain.org' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('From [EMAIL_REDACTED] to [EMAIL_REDACTED]')
    })
  })

  describe('WhatsApp JID redaction', () => {
    it('redacts WhatsApp JID format', () => {
      const event: Event = { message: 'Chat with 48123456789@c.us' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Chat with [JID_REDACTED]')
    })

    it('redacts multiple JIDs', () => {
      const event: Event = { message: 'From 48123456789@c.us to 1234567890@c.us' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('From [JID_REDACTED] to [JID_REDACTED]')
    })
  })

  describe('Token redaction', () => {
    it('redacts verification_code tokens', () => {
      const event: Event = { message: 'verification_code: abc123xyz' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('verification_code: [TOKEN_REDACTED]')
    })

    it('redacts access_token tokens', () => {
      const event: Event = { message: 'access_token=secret123' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('access_token: [TOKEN_REDACTED]')
    })

    it('redacts refresh_token tokens', () => {
      const event: Event = { message: 'refresh_token: token456' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('refresh_token: [TOKEN_REDACTED]')
    })

    it('redacts bearer tokens', () => {
      const event: Event = { message: 'Authorization: bearer xyz789' }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.message).toBe('Authorization: bearer: [TOKEN_REDACTED]')
    })
  })

  describe('Exception value sanitization', () => {
    it('sanitizes exception values', () => {
      const event: Event = {
        exception: {
          values: [
            {
              type: 'Error',
              value: 'Failed to lookup +48123456789',
            },
          ],
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.exception?.values?.[0]?.value).toBe('Failed to lookup [PHONE_REDACTED]')
    })

    it('sanitizes multiple exception values', () => {
      const event: Event = {
        exception: {
          values: [
            { type: 'Error', value: 'Contact test@example.com failed' },
            { type: 'NetworkError', value: 'JID 48123456789@c.us not found' },
          ],
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.exception?.values?.[0]?.value).toBe('Contact [EMAIL_REDACTED] failed')
      expect(sanitized?.exception?.values?.[1]?.value).toBe('JID [JID_REDACTED] not found')
    })
  })

  describe('Breadcrumb sanitization', () => {
    it('sanitizes breadcrumb messages', () => {
      const event: Event = {
        breadcrumbs: [
          {
            message: 'User clicked contact +48123456789',
            category: 'ui',
            level: 'info',
            timestamp: Date.now() / 1000,
          },
        ],
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.breadcrumbs?.[0]?.message).toBe('User clicked contact [PHONE_REDACTED]')
    })

    it('sanitizes breadcrumb data', () => {
      const event: Event = {
        breadcrumbs: [
          {
            message: 'API call',
            category: 'api',
            level: 'info',
            timestamp: Date.now() / 1000,
            data: {
              phone: '+48123456789',
              email: 'test@example.com',
            },
          },
        ],
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.breadcrumbs?.[0]?.data?.phone).toBe('[REDACTED]')
      expect(sanitized?.breadcrumbs?.[0]?.data?.email).toBe('[REDACTED]')
    })
  })

  describe('Nested object sanitization', () => {
    it('sanitizes nested objects', () => {
      const event: Event = {
        extra: {
          user: {
            contact: {
              phone: '+48123456789',
              email: 'test@example.com',
            },
          },
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.user?.contact?.phone).toBe('[REDACTED]')
      expect(sanitized?.extra?.user?.contact?.email).toBe('[REDACTED]')
    })

    it('sanitizes arrays with nested objects', () => {
      const event: Event = {
        extra: {
          contacts: [
            { name: 'John', phone: '+48123456789' },
            { name: 'Jane', email: 'jane@example.com' },
          ],
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.contacts[0].name).toBe('[REDACTED]')
      expect(sanitized?.extra?.contacts[0].phone).toBe('[REDACTED]')
      expect(sanitized?.extra?.contacts[1].name).toBe('[REDACTED]')
      expect(sanitized?.extra?.contacts[1].email).toBe('[REDACTED]')
    })
  })

  describe('Sensitive key detection', () => {
    it('redacts values with phone-related keys', () => {
      const event: Event = {
        extra: {
          phoneNumber: '123456789',
          userPhone: '987654321',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.phoneNumber).toBe('[REDACTED]')
      expect(sanitized?.extra?.userPhone).toBe('[REDACTED]')
    })

    it('redacts values with email-related keys', () => {
      const event: Event = {
        extra: {
          email: 'test@example.com',
          userEmail: 'user@example.com',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.email).toBe('[REDACTED]')
      expect(sanitized?.extra?.userEmail).toBe('[REDACTED]')
    })

    it('redacts values with name-related keys', () => {
      const event: Event = {
        extra: {
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.name).toBe('[REDACTED]')
      expect(sanitized?.extra?.firstName).toBe('[REDACTED]')
      expect(sanitized?.extra?.lastName).toBe('[REDACTED]')
    })

    it('redacts values with token-related keys', () => {
      const event: Event = {
        extra: {
          token: 'secret123',
          accessToken: 'abc456',
          password: 'pass789',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.token).toBe('[REDACTED]')
      expect(sanitized?.extra?.accessToken).toBe('[REDACTED]')
      expect(sanitized?.extra?.password).toBe('[REDACTED]')
    })

    it('redacts values with jid-related keys', () => {
      const event: Event = {
        extra: {
          jid: '48123456789@c.us',
          whatsappJid: '1234567890@c.us',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.extra?.jid).toBe('[REDACTED]')
      expect(sanitized?.extra?.whatsappJid).toBe('[REDACTED]')
    })
  })

  describe('Context sanitization', () => {
    it('sanitizes context data', () => {
      const event: Event = {
        contexts: {
          user: {
            email: 'test@example.com',
            phone: '+48123456789',
          },
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.contexts?.user?.email).toBe('[REDACTED]')
      expect(sanitized?.contexts?.user?.phone).toBe('[REDACTED]')
    })
  })

  describe('Request data sanitization', () => {
    it('sanitizes request data', () => {
      const event: Event = {
        request: {
          url: 'https://api.example.com/users/test@example.com',
          query_string: 'phone=+48123456789',
        },
      }
      const sanitized = sanitizeEvent(event)
      expect(sanitized?.request?.url).toBe('https://api.example.com/users/[EMAIL_REDACTED]')
      expect(sanitized?.request?.query_string).toContain('[PHONE_REDACTED]')
    })
  })

  describe('Mixed PII in complex structures', () => {
    it('sanitizes all PII types in a complex event', () => {
      const event: Event = {
        message: 'Error for user test@example.com with phone +48123456789',
        exception: {
          values: [
            {
              type: 'Error',
              value: 'JID 48123456789@c.us not found',
            },
          ],
        },
        breadcrumbs: [
          {
            message: 'User test@example.com clicked contact',
            category: 'ui',
            level: 'info',
            timestamp: Date.now() / 1000,
            data: {
              phone: '+48123456789',
              token: 'secret123',
            },
          },
        ],
        extra: {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
          auth: {
            access_token: 'xyz789',
          },
        },
      }

      const sanitized = sanitizeEvent(event)

      // Check message
      expect(sanitized?.message).toBe('Error for user [EMAIL_REDACTED] with phone [PHONE_REDACTED]')

      // Check exception
      expect(sanitized?.exception?.values?.[0]?.value).toBe('JID [JID_REDACTED] not found')

      // Check breadcrumbs
      expect(sanitized?.breadcrumbs?.[0]?.message).toBe('User [EMAIL_REDACTED] clicked contact')
      expect(sanitized?.breadcrumbs?.[0]?.data?.phone).toBe('[REDACTED]')
      expect(sanitized?.breadcrumbs?.[0]?.data?.token).toBe('[REDACTED]')

      // Check extra
      expect(sanitized?.extra?.user?.name).toBe('[REDACTED]')
      expect(sanitized?.extra?.user?.email).toBe('[REDACTED]')
      expect(sanitized?.extra?.user?.phone).toBe('[REDACTED]')
      expect(sanitized?.extra?.auth?.access_token).toBe('[REDACTED]')
    })
  })

  describe('Non-PII data preservation', () => {
    it('preserves non-sensitive data', () => {
      const event: Event = {
        message: 'Error occurred in component',
        extra: {
          componentName: 'PersonCard',
          errorCode: 500,
          timestamp: '2025-01-01T00:00:00Z',
        },
      }

      const sanitized = sanitizeEvent(event)

      expect(sanitized?.message).toBe('Error occurred in component')
      expect(sanitized?.extra?.componentName).toBe('PersonCard')
      expect(sanitized?.extra?.errorCode).toBe(500)
      expect(sanitized?.extra?.timestamp).toBe('2025-01-01T00:00:00Z')
    })
  })
})
