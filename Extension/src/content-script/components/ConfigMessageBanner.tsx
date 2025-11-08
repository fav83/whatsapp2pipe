import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

interface ConfigMessageBannerProps {
  markdown: string
  onDismiss: () => void
}

// Custom sanitization schema - allow safe HTML tags and attributes
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'p',
    'a',
    'strong',
    'em',
    'br',
    'ul',
    'ol',
    'li',
    'b',
    'i',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'target', 'rel'],
  },
}

export const ConfigMessageBanner: React.FC<ConfigMessageBannerProps> = ({
  markdown,
  onDismiss,
}) => {
  return (
    <div
      className="bg-slate-500 border-b border-solid border-slate-600 px-4 py-3 flex items-start gap-3"
      role="region"
      aria-label="Admin message"
    >
      {/* Message Content */}
      <div className="flex-1 text-sm text-white prose prose-sm max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={{
            // Ensure links have noopener noreferrer for security
            a: ({ node: _node, ...props }) => (
              <a
                {...props}
                rel="noopener noreferrer"
                className="text-blue-200 hover:text-blue-100 underline font-medium"
              />
            ),
            // Style paragraphs
            p: ({ node: _node, ...props }) => <p {...props} className="m-0" />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        aria-label="Dismiss message"
        type="button"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
