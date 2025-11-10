import { Link } from 'react-router-dom'
import { Button } from '../ui/button'

interface HeaderProps {
  onSignOut?: () => void
}

export function Header({ onSignOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-normal text-slate-700 font-display hover:text-slate-900 transition-colors cursor-pointer">
              chat2deal
            </h1>
          </Link>

          {onSignOut && (
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
