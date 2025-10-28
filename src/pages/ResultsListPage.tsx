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
          event_type,
          races!inner(
            id,
            results!inner(id)
          )
        `)
        .eq('status', 'published')
        .order('start_date', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsWithResults = eventsData?.filter(event =>
        event.races && event.races.length > 0 &&
        event.races.some((race: any) => race.results && race.results.length > 0)
      ) || [];

      setEvents(eventsWithResults.slice(0, 20));
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadGlobalStats() {
    try {
      let allResults: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: results, error } = await Bolt Database
          .from('results')
          .select(`
            id,
            gender,
            category,
            race_id,
            races!inner(sport_type, event_id, events!inner(id))
          `)
          .range(from, from + pageSize - 1);

        if (error) {
          console.error('Error loading results:', error);
          throw error;
        }

        if (results && results.length > 0) {
          allResults = [...allResults, ...results];
          from += pageSize;
          hasMore = results.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      const uniqueEvents = new Set();
      const globalStats: GlobalStats = {
        total_results: allResults.length,
        by_gender: { male: 0, female: 0, other: 0 },
        by_age_group: {},
        by_license: {},
        by_sport: {}
      };

      allResults.forEach((result: any) => {
        if (result.gender === 'M') globalStats.by_gender.male++;
        else if (result.gender === 'F') globalStats.by_gender.female++;
        else globalStats.by_gender.other++;

        if (result.category) {
          const category = result.category;
          globalStats.by_age_group[category] = (globalStats.by_age_group[category] || 0) + 1;
        }

        if (result.races?.sport_type) {
          const sport = result.races.sport_type;
          globalStats.by_sport[sport] = (globalStats.by_sport[sport] || 0) + 1;
        }

        if (result.races?.events?.id) {
          uniqueEvents.add(result.races.events.id);
        }
      });

      setStats(globalStats);
    } catch (err) {
      console.error('Error loading global stats:', err);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getSportColor = (sportType: string) => {
    const colors: { [key: string]: string } = {
      'running': 'bg-blue-500',
      'trail': 'bg-green-600',
      'triathlon': 'bg-purple-600',
      'cycling': 'bg-yellow-500',
      'swimming': 'bg-cyan-500',
      'obstacle': 'bg-red-600',
      'walking': 'bg-teal-500',
      'other': 'bg-gray-600'
    };
    return colors[sportType] || colors['other'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Résultats des Événements</h1>
          <p className="text-lg text-gray-600">
            Consultez les résultats et classements de tous nos événements passés
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900">Statistiques Globales</h2>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-pink-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total_results.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Résultats</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.by_gender.male + stats.by_gender.female}</div>
                  <div className="text-xs text-gray-600">Participants</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{Object.keys(stats.by_sport).length}</div>
                  <div className="text-xs text-gray-600">Sports</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                  <div className="text-xs text-gray-600">Événements</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Par Genre</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hommes</span>
                  <span className="font-semibold">{stats.by_gender.male}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Femmes</span>
                  <span className="font-semibold">{stats.by_gender.female}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Par Sport</h3>
              <div className="space-y-2">
                {Object.entries(stats.by_sport).slice(0, 3).map(([sport, count]) => (
                  <div key={sport} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{sport}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Par Licence</h3>
              <div className="space-y-2">
                {Object.entries(stats.by_license).slice(0, 3).map(([license, count]) => (
                  <div key={license} className="flex justify-between text-sm">
                    <span className="text-gray-600">{license}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Par Âge</h3>
              <div className="space-y-2">
                {Object.entries(stats.by_age_group).slice(0, 3).map(([age, count]) => (
                  <div key={age} className="flex justify-between text-sm">
                    <span className="text-gray-600">{age}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Événements avec Résultats</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun résultat disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 ${getSportColor(event.event_type)} rounded-lg text-xs font-bold text-white uppercase tracking-wide shadow-lg`}>
                      {event.event_type}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        <span>{event.city}</span>
                      </div>
                    </div>

                    <Link
                      to={`/resultats/${event.slug}`}
                      className="relative flex items-center justify-center w-full text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg overflow-hidden group"
                      style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${getSportImage(event.event_type as any)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-pink-600/20 group-hover:from-pink-500/30 group-hover:to-pink-600/30 transition-all"></div>
                      <Trophy className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">Voir les résultats</span>
                      <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
