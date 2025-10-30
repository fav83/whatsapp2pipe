/**
 * PersonNoMatchState Component
 *
 * Displays form UI when no matching person is found in Pipedrive.
 * Shows two options: Create new person OR link to existing person.
 * Note: Buttons are non-functional in Feature 9 (UI only).
 * Functionality will be implemented in Features 10 & 11.
 */

interface PersonNoMatchStateProps {
  contactName: string
  phone: string
}

export function PersonNoMatchState({ contactName, phone }: PersonNoMatchStateProps) {
  return (
    <div className="px-5 pt-5">
      {/* Contact Info Header */}
      <div className="mb-4">
        <div className="text-base font-semibold text-[#111b21] mb-1">{contactName}</div>
        <div className="text-sm text-[#667781]">{phone}</div>
      </div>

      {/* Section 1: Create New Person */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#111b21] mb-3">Add this contact to Pipedrive</h3>

        {/* Name Input */}
        <div className="mb-3">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#d1d7db] rounded-lg bg-white">
            <span className="text-[#667781] text-sm font-medium">T</span>
            <input
              type="text"
              defaultValue={contactName}
              placeholder="Name"
              disabled
              className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#d1d7db] rounded-lg bg-white">
            <span className="text-[#667781] text-sm font-medium">@</span>
            <input
              type="email"
              placeholder="Email"
              disabled
              className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          disabled
          className="w-full px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg opacity-60 cursor-not-allowed"
        >
          Create
        </button>
      </div>

      {/* Section 2: Link to Existing Person */}
      <div className="pt-4 border-t border-[#d1d7db]">
        <p className="text-sm text-[#667781] mb-3">
          Or add the number <span className="font-medium text-[#111b21]">{phone}</span> to an
          existing contact
        </p>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-2 border border-[#d1d7db] rounded-lg bg-white">
          <svg
            className="w-4 h-4 text-[#667781]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search contact..."
            disabled
            className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  )
}
