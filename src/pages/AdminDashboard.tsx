import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Trophy,
  Image,
  Mail,
  Settings
} from 'lucide-react';
import AdminLayout from '../components/Admin/AdminLayout';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard', color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Organisateurs', path: '/admin/organizers', color: 'from-green-500 to-green-600' },
    { icon: Calendar, label: 'Événements', path: '/admin/events', color: 'from-purple-500 to-purple-600' },
    { icon: FileText, label: 'Inscriptions', path: '/admin/entries', color: 'from-pink-500 to-pink-600' },
    { icon: CreditCard, label: 'Finance', path: '/admin/finance', color: 'from-yellow-500 to-yellow-600' },
    { icon: Trophy, label: 'Chrono/Résultats', path: '/admin/results', color: 'from-red-500 to-red-600' },
    { icon: Image, label: 'Médias', path: '/admin/media', color: 'from-orange-500 to-orange-600' },
    { icon: Mail, label: 'Communications', path: '/admin/communications', color: 'from-teal-500 to-teal-600' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings', color: 'from-gray-500 to-gray-600' },
  ];

  const stats = [
    { label: 'Événements actifs', value: '47', change: '+12%', color: 'bg-blue-500' },
    { label: 'Inscriptions ce mois', value: '1,234', change: '+18%', color: 'bg-green-500' },
    { label: 'CA ce mois', value: '45,678 €', change: '+8%', color: 'bg-purple-500' },
    { label: 'Organisateurs', value: '89', change: '+5%', color: 'bg-pink-500' },
  ];

  return (
    <AdminLayout title="Tableau de bord">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.name || 'Admin'}
          </h2>
          <p className="text-gray-600">
            Vue d'ensemble de votre plateforme Timepulse
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Accès rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h4>
                <p className="text-sm text-gray-600">
                  Gérer et consulter {item.label.toLowerCase()}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Système opérationnel</h3>
              <p className="text-white/90">
                Tous les services fonctionnent normalement. Dernière mise à jour : aujourd'hui à 14:30
              </p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
