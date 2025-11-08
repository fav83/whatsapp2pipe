import React from 'react'

interface FeedbackButtonProps {
  onClick: () => void
}

/**
 * Fixed feedback button component
 * Displayed at the bottom of the sidebar for authenticated users
 */
export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-[38px] flex items-center justify-center gap-2 px-4
        bg-white border border-solid border-border-primary rounded-lg
        text-secondary text-sm font-medium
        hover:bg-brand-primary hover:text-white hover:border-brand-primary
        active:bg-brand-hover transition-colors cursor-pointer group"
      aria-label="Send feedback"
    >
      {/* Speech bubble icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-secondary group-hover:text-white transition-colors"
      >
        <path
          d="M14 10.5C14 11.328 13.328 12 12.5 12H4.5L2 14.5V3.5C2 2.672 2.672 2 3.5 2H12.5C13.328 2 14 2.672 14 3.5V10.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      Send Feedback
    </button>
  )
}
