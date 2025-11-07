import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <Link to="/">
          <h1 className="text-2xl font-normal text-slate-700 font-display hover:text-slate-900 transition-colors cursor-pointer">
            chat2deal
          </h1>
        </Link>
      </div>
    </header>
  )
}
