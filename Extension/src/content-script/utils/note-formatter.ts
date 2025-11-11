import { ExtractedMessage } from '../services/message-extractor'

/**
 * Format extracted messages as a note with WhatsApp Conversation header
 * and timestamps in [hh:mm dd/MM/yyyy] format
 *
 * @param messages - Array of extracted messages
 * @returns Formatted note content
 */
export function formatMessagesAsNote(messages: ExtractedMessage[]): string {
  if (messages.length === 0) {
    return '=== WhatsApp Conversation ==='
  }

  const lines = ['=== WhatsApp Conversation ===', ''] // Add blank line after header

  for (const message of messages) {
    const date = new Date(message.timestamp * 1000) // Convert to milliseconds
    const formattedTimestamp = formatTimestamp(date)
    const line = `[${formattedTimestamp}] ${message.senderName}: ${message.text}`
    lines.push(line)
    lines.push('') // Add blank line after each message
  }

  return lines.join('\n')
}

/**
 * Format timestamp as [hh:mm dd/MM/yyyy]
 * @param date - Date object
 * @returns Formatted string
 */
function formatTimestamp(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // 0-indexed
  const year = date.getFullYear()

  return `${hours}:${minutes} ${day}/${month}/${year}`
}
