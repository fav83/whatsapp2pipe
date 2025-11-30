import type { ReactNode } from 'react';

interface FeatureHighlightProps {
  title?: string;
  icon?: 'tip' | 'info' | 'warning';
  children: ReactNode;
}

const iconMap = {
  tip: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const colorMap = {
  tip: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    icon: 'text-green-600',
    title: 'text-green-800',
  },
  info: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-400',
    icon: 'text-indigo-600',
    title: 'text-indigo-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    icon: 'text-amber-600',
    title: 'text-amber-800',
  },
};

/**
 * Callout box component for highlighting important information.
 */
export function FeatureHighlight({ title, icon = 'info', children }: FeatureHighlightProps) {
  const colors = colorMap[icon];

  return (
    <div className={`my-6 rounded-lg ${colors.bg} border-l-4 ${colors.border} p-4`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
          {iconMap[icon]}
        </span>
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${colors.title} mb-1`}>
              {title}
            </h4>
          )}
          <div className="text-gray-700 prose-p:my-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
