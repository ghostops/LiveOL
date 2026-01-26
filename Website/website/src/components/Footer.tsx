import { Link } from '@tanstack/react-router'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/images/icon.png"
                alt="LiveOL Logo"
                className="w-6 h-6 rounded"
              />
              <span className="text-xl font-bold text-white font-mono">
                LiveOL
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Real-time orienteering results and competition analysis
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/newsletter"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Newsletter
                </Link>
              </li>
              <li>
                <Link
                  to="/issues"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Report Bug
                </Link>
              </li>
              <li>
                <Link
                  to="/ludvig"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  About Ludvig
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="text-gray-400 hover:text-blue-400 text-sm"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} LiveOL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
