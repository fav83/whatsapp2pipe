import type { Event, EventHint } from '@sentry/browser'

// PII redaction patterns
// Phone pattern: Matches various phone number formats
const PHONE_PATTERN =
  /\+\d{10,15}(?!\d)|\+\d{1,4}[\s-]\d{1,4}(?:[\s-]\d{1,4}){0,3}|\(\d{1,4}\)[\s-]?\d{1,4}(?:[\s-]\d{1,4}){0,2}|\b\d{3}[\s-]\d{3}[\s-]\d{3,9}|(?<!\d)\d{10,15}(?!\d)/g
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const JID_PATTERN = /[0-9]{10,15}@c\.us/g
const TOKEN_PATTERN = /(verification_code|access_token|refresh_token|bearer)\s*[:=]?\s*[^\s,}]+/gi

/**
 * Recursively sanitize object/array/string values
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Order matters: JID pattern must run before PHONE pattern
    // because JID contains phone numbers
    return value
      .replace(JID_PATTERN, '[JID_REDACTED]')
      .replace(PHONE_PATTERN, '[PHONE_REDACTED]')
      .replace(EMAIL_PATTERN, '[EMAIL_REDACTED]')
      .replace(TOKEN_PATTERN, '$1: [TOKEN_REDACTED]')
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      // Redact entire value if key suggests sensitive data
      // Check for keys that contain sensitive terms, but avoid false positives like "componentName"
      const isSensitiveKey =
        /^phone/i.test(key) || // phoneNumber, phone, phoneId
        /phone$/i.test(key) || // userPhone, contactPhone
        /^email/i.test(key) || // emailAddress, email
        /email$/i.test(key) || // userEmail, contactEmail
        /^name$/i.test(key) || // name (exact match)
        /(first|last|full)name$/i.test(key) || // firstName, lastName, fullName
        /token/i.test(key) || // token, accessToken, refreshToken
        /jid/i.test(key) || // jid, whatsappJid
        /password/i.test(key) || // password, userPassword
        /secret/i.test(key) // secret, apiSecret

      if (isSensitiveKey) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeValue(val)
      }
    }
    return sanitized
  }

  return value
}

/**
 * beforeSend handler for Sentry
 * Strips all PII from error events before sending
 */
export function sanitizeEvent(event: Event, _hint?: EventHint): Event | null {
  // Sanitize error message
  if (event.message) {
    event.message = sanitizeValue(event.message)
  }

  // Sanitize exception values
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((exception) => ({
      ...exception,
      value: exception.value ? sanitizeValue(exception.value) : exception.value,
    }))
  }

  // Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message: breadcrumb.message ? sanitizeValue(breadcrumb.message) : breadcrumb.message,
      data: breadcrumb.data ? sanitizeValue(breadcrumb.data) : breadcrumb.data,
    }))
  }

  // Sanitize contexts (extra data)
  // IMPORTANT: Skip Sentry's internal contexts (trace, app, browser, os, device, runtime)
  // These contain technical data, not PII
  if (event.contexts) {
    const SENTRY_INTERNAL_CONTEXTS = ['trace', 'app', 'browser', 'os', 'device', 'runtime']
    const sanitizedContexts: Record<string, unknown> = {}

    for (const [contextName, contextValue] of Object.entries(event.contexts)) {
      if (SENTRY_INTERNAL_CONTEXTS.includes(contextName)) {
        // Keep Sentry's internal contexts untouched
        sanitizedContexts[contextName] = contextValue
      } else {
        // Sanitize user-provided contexts
        sanitizedContexts[contextName] = sanitizeValue(contextValue)
      }
    }

    event.contexts = sanitizedContexts
  }

  // Sanitize request data
  if (event.request) {
    event.request = sanitizeValue(event.request)
  }

  // Sanitize extra data
  if (event.extra) {
    event.extra = sanitizeValue(event.extra)
  }

  return event
}
