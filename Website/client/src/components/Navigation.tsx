import { Link } from 'react-router-dom';

export default function Navigation() {
  const links = [
    { path: '/contact', label: 'Contact' },
    { path: '/newsletter', label: 'Newsletter' },
    { path: '/issues', label: 'Report Bug' },
    { path: '/ludvig', label: 'About' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
    { path: '/licenses', label: 'Licenses' },
  ];

  return (
    <nav className="bg-base-surface shadow-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/images/icon.png" alt="LiveOL Logo" className="size-6 rounded" />
            <span className="text-xl font-bold text-text-main font-mono">LiveOL</span>
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
          <button className="md:hidden text-text-main">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
