import { useAuth } from '../../contexts/AuthContext';
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
  Settings,
  LogOut,
  Shield,
  Menu,
  FileCode,
  DollarSign,
  Database
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: Users, label: 'Organisateurs', path: '/admin/organizers' },
    { icon: Calendar, label: 'Événements', path: '/admin/events' },
    { icon: FileText, label: 'Inscriptions', path: '/admin/entries' },
    { icon: CreditCard, label: 'Finance', path: '/admin/finance' },
    { icon: DollarSign, label: 'Commission', path: '/admin/commission' },
    { icon: FileCode, label: 'Pages Services', path: '/admin/services' },
    { icon: Trophy, label: 'Résultats', path: '/admin/results' },
    { icon: Image, label: 'Médias', path: '/admin/media' },
    { icon: Database, label: 'Sauvegardes', path: '/admin/backups' },
    { icon: Mail, label: 'Communications', path: '/admin/communications' },
    { icon: Mail, label: 'Monitoring Emails', path: '/admin/email-monitoring' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Timepulse Admin</h1>
              <p className="text-sm text-gray-600">{title || 'Back-office de gestion'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-600">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.role}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg transition-transform duration-300 ease-in-out overflow-y-auto`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:text-pink-600 rounded-lg transition-colors group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
