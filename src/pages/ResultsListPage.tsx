import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, ArrowRight, TrendingUp, Users, Award, Activity } from 'lucide-react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { Bolt Database } from '../lib/Bolt Database';
import { getSportImage } from '../lib/sport-images';

interface Event {
  id: string;
  name: string;
  slug: string;
  city: string;
  start_date: string;
  image_url: string | null;
  event_type: string;
}

interface GlobalStats {
  total_results: number;
  by_gender: { male: number; female: number; other: number };
  by_age_group: { [key: string]: number };
  by_license: { [key: string]: number };
  by_sport: { [key: string]: number };
}

export default function ResultsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    total_results: 0,
    by_gender: { male: 0, female: 0, other: 0 },
    by_age_group: {},
    by_license: {},
    by_sport: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventsWithResults();
    loadGlobalStats();
  }, []);

  async function loadEventsWithResults() {
    try {
      const { data: eventsData, error: eventsError } = await Bolt Database
        .from('events')
        .select(`
          id,
          name,
          slug,
          city,
          start_date,
          image_url,
          event_type
        `)
        .eq('published', true)
        .order('start_date', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsWithResults = [];
      for (const event of eventsData || []) {
        const { count } = await Bolt Database
          .from('results')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        if (count && count > 0) {
          eventsWithResults.push(event);
        }
      }

      setEvents(eventsWithResults);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGlobalStats() {
    try {
      const { data: results, error } = await Bolt Database
        .from('results')
        .select('gender, age_category, license_type, event_id');

      if (error) throw error;

      const statsCalc: GlobalStats = {
        total_results: results?.length || 0,
        by_gender: { male: 0, female: 0, other: 0 },
        by_age_group: {},
        by_license: {},
        by_sport: {}
      };

      results?.forEach(result => {
        if (result.gender === 'M') statsCalc.by_gender.male++;
        else if (result.gender === 'F') statsCalc.by_gender.female++;
        else statsCalc.by_gender.other++;

        if (result.age_category) {
          statsCalc.by_age_group[result.age_category] = 
            (statsCalc.by_age_group[result.age_category] || 0) + 1;
        }

        if (result.license_type) {
          statsCalc.by_license[result.license_type] = 
            (statsCalc.by_license[result.license_type] || 0) + 1;
        }
      });

      setStats(statsCalc);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des résultats...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Résultats des Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Consultez les classements et performances de tous les événements chronométrés par Timepulse
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.total_results.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Résultats totaux</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {events.length}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Événements</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.by_gender.male.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Hommes</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-pink-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {stats.by_gender.female.toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Femmes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/resultats/${event.slug}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url || getSportImage(event.event_type)}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                      {event.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="font-medium">{event.city}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>
                      {new Date(event.start_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-semibold group-hover:text-blue-700">
                      Voir les résultats
                    </span>
                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                Aucun résultat disponible pour le moment
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
