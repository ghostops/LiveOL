import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-surface border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div>
                <img src="/assets/images/icon.png" alt="LiveOL Logo" className="size-6 rounded" />
              </div>
              <span className="text-xl font-bold text-text-main mono !normal-case">LiveOL</span>
            </div>
            <p className="text-text-muted text-sm">
              Real-time orienteering results and competition analysis
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-text-main mb-4">Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-text-muted hover:text-brand-primary text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/newsletter" className="text-text-muted hover:text-brand-primary text-sm">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link to="/issues" className="text-text-muted hover:text-brand-primary text-sm">
                  Report Bug
                </Link>
              </li>
              <li>
                <Link to="/ludvig" className="text-text-muted hover:text-brand-primary text-sm">
                  About Ludvig
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-main mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-text-muted hover:text-brand-primary text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-muted hover:text-brand-primary text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/licenses" className="text-text-muted hover:text-brand-primary text-sm">
                  Open Source Licenses
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm">
            &copy; {currentYear} LiveOL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
