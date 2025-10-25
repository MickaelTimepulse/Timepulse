import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-6 h-6 text-pink-500" />
              <span className="text-xl font-bold text-white">Timepulse</span>
            </div>
            <p className="text-sm text-gray-400">
              Plateforme d'inscriptions et de chronométrage pour événements sportifs depuis 2009.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-pink-500 transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/organizer/register" className="hover:text-pink-500 transition-colors">
                  Devenir organisateur
                </Link>
              </li>
              <li>
                <Link to="/organizer/login" className="hover:text-pink-500 transition-colors">
                  Connexion organisateur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-pink-500 transition-colors">
                  Chronométrage
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500 transition-colors">
                  Inscriptions en ligne
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-500 transition-colors">
                  Gestion des résultats
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-pink-500" />
                <span>contact@timepulse.fr</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-pink-500" />
                <span>+33 4 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span>Grenoble, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Timepulse. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
