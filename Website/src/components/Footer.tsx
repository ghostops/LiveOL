import { Link } from '@tanstack/react-router'
import DownloadButtons from './DownloadButtons'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-base-surface border-t border-t-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div>
                <img
                  src="/assets/images/icon.png"
                  alt="LiveOL Logo"
                  className="size-6 rounded"
                />
              </div>
              <span className="text-xl font-bold text-text-main font-mono">
                LiveOL
              </span>
            </div>
            <p className="text-text-muted text-sm mb-6">
              Real-time orienteering results and competition analysis
            </p>
            <DownloadButtons size="small" />
          </div>

          <div>
            <h3 className="font-semibold text-text-main mb-4">Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  About LiveOL
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/newsletter"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  Newsletter
                </Link>
              </li>
              <li>
                <Link
                  to="/issues"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  Report a bug
                </Link>
              </li>
              <li>
                <Link
                  to="/ludvig-larsendahl"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  About the creator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-main mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-text-muted hover:text-brand-primary text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-t-gray-300 mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} LiveOL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
