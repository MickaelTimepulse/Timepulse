import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, MapPin, Users as UsersIcon } from 'lucide-react';
import AdminLayout from '../components/Admin/AdminLayout';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const events = [
    { id: 1, name: 'Trail des Écrins 2025', slug: 'trail-ecrins-2025', date: '2025-06-15', location: 'Briançon', participants: 450, status: 'published' },
    { id: 2, name: 'Marathon du Mont-Blanc', slug: 'marathon-mont-blanc-2025', date: '2025-07-10', location: 'Chamonix', participants: 1200, status: 'published' },
    { id: 3, name: 'Swimrun des Calanques', slug: 'swimrun-calanques-2025', date: '2025-05-20', location: 'Marseille', participants: 320, status: 'draft' },
  ];

  return (
    <AdminLayout title="Événements">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
            <p className="text-gray-600 mt-1">Créez et gérez les événements sportifs</p>
          </div>
          <button
            onClick={() => navigate('/organizer/events/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel événement</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {event.participants} inscrits
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => navigate(`/organizer/events/${event.slug}`)}
                    className="text-pink-600 hover:text-pink-800 font-medium text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => navigate(`/organizer/events/${event.slug}`)}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
