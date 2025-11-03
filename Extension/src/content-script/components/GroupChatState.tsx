/**
 * Group Chat State Component
 *
 * Displays a message when user selects a group chat.
 * Group chats are not supported in MVP - only 1:1 conversations.
 */

/**
 * GroupChatState Component
 *
 * Shows an informational message that group chats are not supported,
 * with guidance to select a 1:1 chat instead.
 *
 * This is styled as informational (gray), not an error (red),
 * since group chat selection is a valid user action.
 */
export function GroupChatState() {
  return (
    <div className="px-4 pt-4">
      <div className="p-3 bg-background-secondary rounded-lg">
        <p className="text-sm text-text-secondary text-center">Group chats are not supported</p>
        <p className="text-xs text-text-secondary text-center mt-2">
          Please select a 1:1 chat to view contact information
        </p>
      </div>
    </div>
  )
}
