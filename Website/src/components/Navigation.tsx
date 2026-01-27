import { Link } from '@tanstack/react-router'
import { useState } from 'react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const links = [
    { path: '/about', label: 'About' },
    { path: '/newsletter', label: 'Newsletter' },
    { path: '/issues', label: 'Report Bug' },
    { path: '/translate', label: 'Translate the app' },
  ]

  return (
    <nav className="bg-base-surface shadow-sm border-b border-b-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/images/icon.png"
              alt="LiveOL Logo"
              className="size-10 rounded"
            />
            <span className="text-xl font-bold text-text-main font-mono">
              LiveOL
            </span>
          </Link>
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-text-main hover:text-brand-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            className="md:hidden text-text-main"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-text-main hover:text-brand-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
