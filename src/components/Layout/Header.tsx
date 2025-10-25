import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, ChevronDown } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            Timepulse
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                onBlur={() => setTimeout(() => setShowLoginMenu(false), 200)}
                className="flex items-center space-x-1 text-gray-900 hover:text-gray-700 font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLoginMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  <Link
                    to="/admin/login"
                    className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowLoginMenu(false)}
                  >
                    Compte Admin Timepulse
                  </Link>
                  <Link
                    to="/organizer/login"
                    className="block px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowLoginMenu(false)}
                  >
                    Compte Organisateur
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/admin/login"
                className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Timepulse
              </Link>
              <Link
                to="/organizer/login"
                className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organisateur
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
