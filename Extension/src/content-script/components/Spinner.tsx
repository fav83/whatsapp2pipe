/**
 * Spinner Component
 *
 * Displays a spinning loading indicator.
 * Used in buttons and loading states.
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'primary'
}

export function Spinner({ size = 'md', color = 'white' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  }

  const colorClasses = {
    white: 'border-white border-t-transparent',
    primary: 'border-brand-primary border-t-transparent',
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-solid rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
}
