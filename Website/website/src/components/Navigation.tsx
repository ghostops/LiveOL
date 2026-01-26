import { Link } from '@tanstack/react-router'

export default function Navigation() {
  const links = [
    { path: '/contact', label: 'Contact' },
    { path: '/newsletter', label: 'Newsletter' },
    { path: '/issues', label: 'Report Bug' },
    { path: '/ludvig', label: 'About' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/changelog', label: 'Changelog' },
  ]

  return (
    <nav className="bg-gray-900 shadow-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/images/icon.png"
              alt="LiveOL Logo"
              className="w-6 h-6 rounded"
            />
            <span className="text-xl font-bold text-white font-mono">
              LiveOL
            </span>
          </Link>
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-blue-400 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
